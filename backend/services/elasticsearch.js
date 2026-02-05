const { Client } = require('@elastic/elasticsearch');

class ElasticsearchService {
  constructor() {
    this.client = null;
    this.indexName = 'products';
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      this.client = new Client({
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
        maxRetries: 3,
        requestTimeout: 30000
      });

      // Check connection
      await this.client.ping();
      console.log('Elasticsearch connected');

      // Create index if not exists
      await this.createIndexIfNotExists();
      this.initialized = true;
    } catch (error) {
      console.error('Elasticsearch connection failed:', error);
      // Continue without Elasticsearch - use MongoDB fallback
      this.initialized = false;
    }
  }

  async createIndexIfNotExists() {
    const exists = await this.client.indices.exists({ index: this.indexName });
    
    if (!exists) {
      await this.client.indices.create({
        index: this.indexName,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                product_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding', 'product_synonyms']
                }
              },
              filter: {
                product_synonyms: {
                  type: 'synonym',
                  synonyms: [
                    'laptop, notebook, computer, pc',
                    'phone, smartphone, cellphone, mobile',
                    'headphones, earbuds, earphones',
                    'tv, television, screen'
                  ]
                }
              }
            }
          },
          mappings: {
            properties: {
              name: { 
                type: 'text', 
                analyzer: 'product_analyzer',
                fields: {
                  keyword: { type: 'keyword' },
                  suggest: { type: 'completion' }
                }
              },
              description: { 
                type: 'text',
                analyzer: 'product_analyzer'
              },
              brand: { type: 'keyword' },
              category: { type: 'keyword' },
              categoryPath: { type: 'keyword' },
              price: { type: 'float' },
              compareAtPrice: { type: 'float' },
              images: { type: 'keyword' },
              inStock: { type: 'boolean' },
              rating: { type: 'float' },
              reviewCount: { type: 'integer' },
              tags: { type: 'keyword' },
              slug: { type: 'keyword' },
              status: { type: 'keyword' },
              totalSold: { type: 'integer' },
              viewCount: { type: 'integer' },
              createdAt: { type: 'date' }
            }
          }
        }
      });

      console.log('Products index created');
    }
  }

  // Index a product
  async indexProduct(product) {
    if (!this.initialized) return;

    try {
      await this.client.index({
        index: this.indexName,
        id: product._id.toString(),
        body: {
          name: product.name,
          description: product.description,
          brand: product.brand,
          category: product.category?.name,
          categoryPath: [product.category?.name, product.subcategory?.name].filter(Boolean),
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          images: product.images?.map(img => img.url),
          inStock: product.quantity > 0,
          rating: product.ratings?.average,
          reviewCount: product.ratings?.count,
          tags: product.tags,
          slug: product.slug,
          status: product.status,
          totalSold: product.totalSold,
          viewCount: product.viewCount,
          createdAt: product.createdAt
        }
      });
    } catch (error) {
      console.error('Index product error:', error);
    }
  }

  // Bulk index products
  async bulkIndexProducts(products) {
    if (!this.initialized) return;

    try {
      const operations = products.flatMap(product => [
        { index: { _index: this.indexName, _id: product._id.toString() } },
        {
          name: product.name,
          description: product.description,
          brand: product.brand,
          category: product.category?.name,
          categoryPath: [product.category?.name, product.subcategory?.name].filter(Boolean),
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          images: product.images?.map(img => img.url),
          inStock: product.quantity > 0,
          rating: product.ratings?.average,
          reviewCount: product.ratings?.count,
          tags: product.tags,
          slug: product.slug,
          status: product.status,
          totalSold: product.totalSold,
          viewCount: product.viewCount,
          createdAt: product.createdAt
        }
      ]);

      await this.client.bulk({ body: operations });
    } catch (error) {
      console.error('Bulk index error:', error);
    }
  }

  // Search products
  async search(params) {
    const {
      query,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      tags,
      sortBy = '_score',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      aggregations = true
    } = params;

    // If Elasticsearch not initialized, return empty results
    if (!this.initialized) {
      return { results: [], total: 0, aggregations: {} };
    }

    try {
      const must = [];
      const filter = [];

      // Full-text search
      if (query) {
        must.push({
          multi_match: {
            query,
            fields: ['name^3', 'description^1', 'brand^2', 'tags^1.5', 'category^1'],
            type: 'best_fields',
            fuzziness: 'AUTO',
            operator: 'or'
          }
        });
      }

      // Category filter
      if (category) {
        filter.push({ term: { category: category.toLowerCase() } });
      }

      // Brand filter
      if (brand) {
        filter.push({ term: { brand: brand } });
      }

      // Price range
      if (minPrice || maxPrice) {
        const range = { price: {} };
        if (minPrice) range.price.gte = minPrice;
        if (maxPrice) range.price.lte = maxPrice;
        filter.push({ range });
      }

      // Rating filter
      if (minRating) {
        filter.push({ range: { rating: { gte: parseFloat(minRating) } } });
      }

      // Stock filter
      if (inStock === 'true') {
        filter.push({ term: { inStock: true } });
      }

      // Tags filter
      if (tags) {
        filter.push({ terms: { tags: tags.split(',') } });
      }

      // Only active products
      filter.push({ term: { status: 'active' } });

      const searchBody = {
        from: (page - 1) * limit,
        size: limit,
        query: {
          bool: {
            must: must.length > 0 ? must : [{ match_all: {} }],
            filter
          }
        },
        sort: this.getSortClause(sortBy, sortOrder),
        aggs: aggregations ? this.getAggregations() : undefined
      };

      const response = await this.client.search({
        index: this.indexName,
        body: searchBody
      });

      return {
        results: response.hits.hits.map(hit => ({
          ...hit._source,
          _id: hit._id,
          score: hit._score
        })),
        total: typeof response.hits.total === 'object' 
          ? response.hits.total.value 
          : response.hits.total,
        page,
        limit,
        pages: Math.ceil(
          (typeof response.hits.total === 'object' 
            ? response.hits.total.value 
            : response.hits.total) / limit
        ),
        aggregations: aggregations ? this.formatAggregations(response.aggregations) : {}
      };
    } catch (error) {
      console.error('Search error:', error);
      return { results: [], total: 0, aggregations: {} };
    }
  }

  // Autocomplete suggestions
  async suggest(query, limit = 5) {
    if (!this.initialized) return [];

    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          suggest: {
            product_suggestions: {
              prefix: query,
              completion: {
                field: 'name.suggest',
                size: limit,
                skip_duplicates: true,
                fuzzy: {
                  fuzziness: 'AUTO'
                }
              }
            }
          }
        }
      });

      return response.suggest?.product_suggestions?.[0]?.options?.map(
        opt => opt.text
      ) || [];
    } catch (error) {
      console.error('Suggest error:', error);
      return [];
    }
  }

  // Delete product from index
  async deleteProduct(productId) {
    if (!this.initialized) return;

    try {
      await this.client.delete({
        index: this.indexName,
        id: productId.toString()
      });
    } catch (error) {
      console.error('Delete product error:', error);
    }
  }

  // Get sort clause
  getSortClause(sortBy, sortOrder) {
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const sortMap = {
      '_score': [{ _score: { order } }],
      'price': [{ price: { order } }],
      'price-asc': [{ price: { order: 'asc' } }],
      'price-desc': [{ price: { order: 'desc' } }],
      'rating': [{ rating: { order } }],
      'newest': [{ createdAt: { order: 'desc' } }],
      'bestselling': [{ totalSold: { order: 'desc' } }],
      'popularity': [{ viewCount: { order: 'desc' } }]
    };

    return sortMap[sortBy] || sortMap['_score'];
  }

  // Get aggregations for filters
  getAggregations() {
    return {
      categories: {
        terms: { field: 'category', size: 20 }
      },
      brands: {
        terms: { field: 'brand', size: 50 }
      },
      price_ranges: {
        range: {
          field: 'price',
          ranges: [
            { key: 'Under $25', to: 25 },
            { key: '$25 - $50', from: 25, to: 50 },
            { key: '$50 - $100', from: 50, to: 100 },
            { key: '$100 - $200', from: 100, to: 200 },
            { key: 'Over $200', from: 200 }
          ]
        }
      },
      ratings: {
        range: {
          field: 'rating',
          ranges: [
            { key: '4+ Stars', from: 4 },
            { key: '3+ Stars', from: 3 },
            { key: '2+ Stars', from: 2 }
          ]
        }
      },
      in_stock: {
        terms: { field: 'inStock' }
      }
    };
  }

  // Format aggregations for response
  formatAggregations(aggs) {
    if (!aggs) return {};

    return {
      categories: (aggs.categories?.buckets || []).map(b => ({
        key: b.key,
        count: b.doc_count
      })),
      brands: (aggs.brands?.buckets || []).map(b => ({
        key: b.key,
        count: b.doc_count
      })),
      priceRanges: (aggs.price_ranges?.buckets || []).map(b => ({
        key: b.key,
        from: b.from,
        to: b.to,
        count: b.doc_count
      })),
      ratings: (aggs.ratings?.buckets || []).map(b => ({
        key: b.key,
        from: b.from,
        to: b.to,
        count: b.doc_count
      }))
    };
  }
}

module.exports = new ElasticsearchService();
