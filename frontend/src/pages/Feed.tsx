import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getPosts, Post } from '@/api/posts';
import { PageTransition } from '@/components/PageTransition';
import { Heart, MessageCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 12;

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  const fetchPosts = useCallback(async (pageNum: number) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const response = await getPosts(pageNum, ITEMS_PER_PAGE);

      if (pageNum === 1) {
        setPosts(response.posts);
      } else {
        setPosts(prev => {
          // Filter out duplicates just in case
          const newPosts = response.posts.filter(
            newPost => !prev.some(p => p.id === newPost.id)
          );
          return [...prev, ...newPosts];
        });
      }

      setHasMore(pageNum < response.total_pages);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (!isFetchingRef.current && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  }, [page, hasMore, fetchPosts]);

  useEffect(() => {
    if (isLoading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoading, hasMore, loadMore]);

  const formatDate = (date: string | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />

        <div className="container mx-auto px-4 py-24">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
              Discover Stories
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore the latest posts from our community of writers
            </p>
          </div>

          {isLoading && page === 1 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="break-inside-avoid">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: (index % ITEMS_PER_PAGE) * 0.05 }}
                    className="break-inside-avoid"
                  >
                    <Link to={`/blog/${post.id}`}>
                      <Card className="lift overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
                        <img
                          src={post.cover_image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop'}
                          alt={post.title}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-2 font-serif line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                <AvatarFallback>
                                  {post.author.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{post.author.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(post.published_at)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.read_time} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post.likes_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {post.comments_count}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {hasMore && (
                <div ref={loadMoreRef} className="mt-12">
                  <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="break-inside-avoid">
                        <Skeleton className="w-full h-48" />
                        <CardContent className="p-6 space-y-3">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {!hasMore && posts.length > 0 && (
                <p className="text-center text-muted-foreground mt-12">
                  You've reached the end! 🎉
                </p>
              )}

              {!isLoading && posts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No stories found yet.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
