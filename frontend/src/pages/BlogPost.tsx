import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { getPost, Post } from '@/api/posts';
import { getPostComments, addComment, Comment } from '@/api/comments';
import { toggleLike, getLikeStatus, toggleBookmark, getBookmarkStatus } from '@/api/likes';
import { PageTransition } from '@/components/PageTransition';
import { ArrowLeft, Clock, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [blog, setBlog] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const postId = parseInt(id);

        // Fetch post details
        const postData = await getPost(postId);
        setBlog(postData);
        setLikesCount(postData.likes_count);

        // Fetch comments
        const commentsData = await getPostComments(postId);
        setComments(commentsData);

        // Fetch like/bookmark status if authenticated
        if (isAuthenticated) {
          const likeStatus = await getLikeStatus(postId);
          setIsLiked(likeStatus.is_liked);

          const bookmarkStatus = await getBookmarkStatus(postId);
          setIsSaved(bookmarkStatus.is_bookmarked);
        }
      } catch (error) {
        console.error('Failed to fetch blog post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like posts');
      return;
    }
    if (!id) return;

    try {
      const response = await toggleLike(parseInt(id));
      setIsLiked(response.is_liked);
      setLikesCount(response.likes_count);
      toast.success(response.is_liked ? 'Added to likes' : 'Removed from likes');
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to bookmark posts');
      return;
    }
    if (!id) return;

    try {
      const response = await toggleBookmark(parseInt(id));
      setIsSaved(response.is_bookmarked);
      toast.success(response.is_bookmarked ? 'Saved for later' : 'Removed from saved');
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      toast.error('Failed to update bookmark status');
    }
  };

  const handleShare = async () => {
    if (!blog) return;
    try {
      await navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url: window.location.href,
      });
    } catch (err) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCommentDate = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInMs = now.getTime() - commentDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return formatDate(date);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !id) return;

    try {
      const comment = await addComment(parseInt(id), newComment);
      setComments([comment, ...comments]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to post comment');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <PageTransition>
        <div className="min-h-screen">
          <Navbar />
          <div className="container mx-auto px-4 py-24 text-center">
            <h1 className="text-4xl font-bold mb-4 font-serif">Blog not found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/feed')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Feed
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />

        <article className="container mx-auto px-4 py-24 max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {/* Cover Image */}
          {blog.cover_image && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 rounded-xl overflow-hidden"
            >
              <img
                src={blog.cover_image}
                alt={blog.title}
                className="w-full h-96 object-cover"
              />
            </motion.div>
          )}

          {/* Title and Meta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {blog.read_time} min read
              </span>
              <span>{formatDate(blog.published_at)}</span>
              {blog.is_draft && (
                <Badge variant="secondary">Draft</Badge>
              )}
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>

          {/* Author Info */}
          {blog.author && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={blog.author.avatar} alt={blog.author.name} />
                        <AvatarFallback>
                          {blog.author.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{blog.author.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Published on {formatDate(blog.published_at)}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Follow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-2 mb-8"
          >
            <Button
              variant={isLiked ? 'default' : 'outline'}
              size="sm"
              onClick={handleLike}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount}
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              {comments.length}
            </Button>
            <Button
              variant={isSaved ? 'default' : 'outline'}
              size="sm"
              onClick={handleSave}
              className="gap-2"
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 ml-auto">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </motion.div>

          <Separator className="mb-8" />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          <Separator className="mb-8" />

          {/* Footer Actions */}
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-2">
              <Button
                variant={isLiked ? 'default' : 'outline'}
                onClick={handleLike}
                className="gap-2"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button variant="outline" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
            <Button variant="outline" onClick={handleSave} className="gap-2">
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save for later'}
            </Button>
          </div>

          <Separator className="mb-8" />

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 font-serif">
              Comments ({comments.length})
            </h2>

            {/* Comment Form - Only for authenticated users */}
            {isAuthenticated ? (
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[100px] mb-3"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim()}
                        >
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Sign in to join the conversation
                    </p>
                    <Button onClick={() => navigate('/login')}>
                      Sign In
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                        <AvatarFallback>
                          {comment.author.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{comment.author.name}</p>
                          <span className="text-sm text-muted-foreground">
                            {formatCommentDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-foreground">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </article>
      </div>
    </PageTransition>
  );
}
