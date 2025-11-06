# Integration Guide - NestJS Backend

This guide shows how to integrate the recommendation API with your NestJS backend.

## Overview

The recommendation system works in real-time:

1. **Track Views**: When a user views a post, send the interaction to the recommendation API
2. **Get Recommendations**: Query the API for personalized post recommendations

## Step 1: Create Recommendation Service in NestJS

Create a new service file: `backend/src/modules/post/service/recommendation.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get(
      'RECOMMENDATION_API_URL',
      'http://localhost:8000',
    );
  }

  async trackView(
    userId: string,
    postId: string,
    postContent?: string,
    postAuthorId?: string,
  ): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/track-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          post_id: postId,
          post_content: postContent,
          post_author_id: postAuthorId,
        }),
      });

      if (!response.ok) {
        this.logger.warn(`Failed to track view: ${response.statusText}`);
      }
    } catch (error) {
      // Don't fail the request if recommendation tracking fails
      this.logger.error(`Error tracking view: ${error.message}`);
    }
  }

  async getRecommendations(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/v1/recommendations/${userId}?limit=${limit}`,
      );

      if (!response.ok) {
        this.logger.warn(
          `Failed to get recommendations: ${response.statusText}`,
        );
        return [];
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      this.logger.error(`Error getting recommendations: ${error.message}`);
      return [];
    }
  }
}
```

## Step 2: Update Post Controller to Track Views

Modify `backend/src/modules/post/controller/post.controller.ts`:

```typescript
import { RecommendationService } from '../service/recommendation.service';

@ApiTags('Post')
@Controller('v1/post')
export class PostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly recommendationService: RecommendationService, // Add this
  ) {}

  // ... existing methods ...

  @Get(':id')
  async getSinglePost(
    @Param('id') id: string,
    @Req() req: any, // Add this to get user info
  ): Promise<any> {
    const post = await this.queryBus.execute(new GetSinglePostQuery(id));

    // Track view if user is authenticated
    if (req.user?.id) {
      // Track asynchronously - don't wait for it
      this.recommendationService
        .trackView(req.user.id, id, post?.content, post?.authorId)
        .catch((err) => {
          // Log error but don't fail the request
          console.error('Failed to track view:', err);
        });
    }

    return post;
  }
}
```

## Step 3: Add Recommendation Endpoint

Add to `backend/src/modules/post/controller/post.controller.ts`:

```typescript
@Get('recommendations')
@ApiBearerAuth()
@UseGuards(AuthGuard)
async getRecommendations(
  @Req() req: any,
  @Query('limit') limit: number = 10,
): Promise<any> {
  const recommendations = await this.recommendationService.getRecommendations(
    req.user?.id,
    limit,
  );

  return {
    data: recommendations,
    count: recommendations.length,
  };
}
```

## Step 4: Register Service in Post Module

Update `backend/src/modules/post/post.module.ts`:

```typescript
import { RecommendationService } from './service/recommendation.service';

@Module({
  imports: [
    // ... existing imports
  ],
  controllers: [PostController],
  providers: [
    // ... existing providers
    RecommendationService, // Add this
  ],
  exports: [RecommendationService], // Export if needed elsewhere
})
export class PostModule {}
```

## Step 5: Add Environment Variable

Add to your `.env` file:

```env
RECOMMENDATION_API_URL=http://localhost:8000
```

## Step 6: Update Frontend (Optional)

In your frontend, when displaying a post, you can also track views:

```javascript
// When user views a post
const trackView = async (postId, postContent) => {
  try {
    await fetch('http://localhost:8000/api/v1/track-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // if needed
      },
      body: JSON.stringify({
        user_id: currentUserId,
        post_id: postId,
        post_content: postContent,
      }),
    });
  } catch (error) {
    console.error('Failed to track view:', error);
  }
};
```

## How It Works

1. **User Views Post**:

   - User clicks/views a post
   - Backend calls `recommendationService.trackView()`
   - Recommendation API updates its similarity matrix in real-time

2. **Get Recommendations**:
   - User requests recommendations
   - API analyzes user's viewing history
   - Returns posts similar to what user has viewed
   - Falls back to popular posts if no history

## Testing

1. Start the recommendation API:

```bash
cd recommendation
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

2. Test tracking a view:

```bash
curl -X POST http://localhost:8000/api/v1/track-view \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "post_id": "post456",
    "post_content": "This is a post about technology"
  }'
```

3. Get recommendations:

```bash
curl http://localhost:8000/api/v1/recommendations/user123?limit=10
```

## Notes

- View tracking is **non-blocking** - it won't slow down your post retrieval
- The system learns incrementally - no batch training needed
- Similarity is based on co-viewing patterns (users who viewed X also viewed Y)
- Recommendations improve as more users interact with posts
