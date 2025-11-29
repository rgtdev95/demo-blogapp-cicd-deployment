import { useNavigate, useParams } from 'react-router-dom';
import { BlogEditor } from '@/components/BlogEditor';
import { getPost, updatePost, UpdatePostData, Post } from '@/api/posts';
import { PageTransition } from '@/components/PageTransition';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function Edit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const post = await getPost(parseInt(id));
        setBlog(post);
      } catch (error) {
        console.error('Failed to fetch post:', error);
        toast.error('Blog not found');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleSave = async (data: any) => {
    if (!id) return;

    try {
      const updateData: UpdatePostData = {
        title: data.title || 'Untitled',
        content: data.content,
        excerpt: data.seoDescription || data.content.replace(/<[^>]*>/g, '').slice(0, 150),
        cover_image: data.coverImage,
        seo_title: data.seoTitle,
        seo_description: data.seoDescription,
        is_draft: true,
        tags: data.tags || [],
      };

      await updatePost(parseInt(id), updateData);
      toast.success('Changes saved successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to update post:', error);
      toast.error('Failed to save changes');
    }
  };

  const handlePublish = async (data: any) => {
    if (!id) return;

    try {
      const updateData: UpdatePostData = {
        title: data.title || 'Untitled',
        content: data.content,
        excerpt: data.seoDescription || data.content.replace(/<[^>]*>/g, '').slice(0, 150),
        cover_image: data.coverImage,
        seo_title: data.seoTitle,
        seo_description: data.seoDescription,
        is_draft: false,
        tags: data.tags || [],
      };

      await updatePost(parseInt(id), updateData);
      toast.success('Blog updated and published!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to publish post:', error);
      toast.error('Failed to publish post');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!blog) return null;

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <BlogEditor
          initialTitle={blog.title}
          initialContent={blog.content}
          initialCoverImage={blog.cover_image}
          initialTags={blog.tags}
          initialSeoTitle={blog.seo_title}
          initialSeoDescription={blog.seo_description}
          onSave={handleSave}
          onPublish={handlePublish}
        />
      </div>
    </PageTransition>
  );
}
