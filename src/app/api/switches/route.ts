import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { switchFilterSchema } from '../../../lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      search: searchParams.get('search') || undefined,
      brands: searchParams.getAll('brands'),
      types: searchParams.getAll('types'),
      minForce: searchParams.get('minForce') ? Number(searchParams.get('minForce')) : undefined,
      maxForce: searchParams.get('maxForce') ? Number(searchParams.get('maxForce')) : undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      soundProfiles: searchParams.getAll('soundProfiles'),
      tactility: searchParams.getAll('tactility'),
      availability: searchParams.get('availability') === 'true' ? true : undefined,
      sortBy: searchParams.get('sortBy') || 'name',
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
    };

    const validatedParams = switchFilterSchema.parse(params);
    
    const where: any = {};
    
    if (validatedParams.search) {
      where.OR = [
        { name: { contains: validatedParams.search, mode: 'insensitive' } },
        { brand: { contains: validatedParams.search, mode: 'insensitive' } },
        { description: { contains: validatedParams.search, mode: 'insensitive' } },
      ];
    }
    
    if (validatedParams.brands && validatedParams.brands.length > 0) {
      where.brand = { in: validatedParams.brands };
    }
    
    if (validatedParams.types && validatedParams.types.length > 0) {
      where.type = { in: validatedParams.types };
    }
    
    if (validatedParams.minForce !== undefined || validatedParams.maxForce !== undefined) {
      where.force = {};
      if (validatedParams.minForce !== undefined) {
        where.force.gte = validatedParams.minForce;
      }
      if (validatedParams.maxForce !== undefined) {
        where.force.lte = validatedParams.maxForce;
      }
    }
    
    if (validatedParams.minPrice !== undefined || validatedParams.maxPrice !== undefined) {
      where.price = {};
      if (validatedParams.minPrice !== undefined) {
        where.price.gte = validatedParams.minPrice;
      }
      if (validatedParams.maxPrice !== undefined) {
        where.price.lte = validatedParams.maxPrice;
      }
    }
    
    if (validatedParams.soundProfiles && validatedParams.soundProfiles.length > 0) {
      where.soundProfile = { in: validatedParams.soundProfiles };
    }
    
    if (validatedParams.tactility && validatedParams.tactility.length > 0) {
      where.tactility = { in: validatedParams.tactility };
    }
    
    if (validatedParams.availability !== undefined) {
      where.availability = validatedParams.availability;
    }
    
    let orderBy: any = { name: 'asc' };
    
    switch (validatedParams.sortBy) {
      case 'price':
        orderBy = { price: 'asc' };
        break;
      case 'force':
        orderBy = { force: 'asc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating':
        orderBy = { reviews: { _count: 'desc' } };
        break;
    }
    
    const skip = (validatedParams.page - 1) * validatedParams.limit;
    
    const [switches, total, brands] = await Promise.all([
      prisma.switch.findMany({
        where,
        orderBy,
        skip,
        take: validatedParams.limit,
        include: {
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              favorites: true,
            },
          },
        },
      }),
      prisma.switch.count({ where }),
      prisma.switch.findMany({
        select: { brand: true },
        distinct: ['brand'],
        orderBy: { brand: 'asc' },
      }),
    ]);
    
    const switchesWithRatings = switches.map((sw) => {
      const totalRating = sw.reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = sw.reviews.length > 0 ? totalRating / sw.reviews.length : 0;
      
      return {
        ...sw,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: sw._count.reviews,
        favoriteCount: sw._count.favorites,
        reviews: undefined,
        _count: undefined,
      };
    });
    
    return NextResponse.json({
      switches: switchesWithRatings,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        pages: Math.ceil(total / validatedParams.limit),
      },
      filters: {
        brands: brands.map((b) => b.brand),
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}