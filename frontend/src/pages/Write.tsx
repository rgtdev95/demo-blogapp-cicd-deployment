import { useNavigate } from 'react-router-dom';
import { BlogEditor } from '@/components/BlogEditor';
import { createPost, CreatePostData } from '@/api/posts';
import { PageTransition } from '@/components/PageTransition';
import { toast } from 'sonner';

export default function Write() {
  const navigate = useNavigate();

  const handleSave = async (data: any) => {
    try {
      const postData: CreatePostData = {
        title: data.title || 'Untitled',
        content: data.content,
        excerpt: data.seoDescription || data.content.replace(/<[^>]*>/g, '').slice(0, 150),
        cover_image: data.coverImage,
        seo_title: data.seoTitle,
        seo_description: data.seoDescription,
        is_draft: true,
        tags: data.tags || [],
      };

      await createPost(postData);
      toast.success('Draft saved successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
    }
  };

  const handlePublish = async (data: any) => {
    try {
      const postData: CreatePostData = {
        title: data.title || 'Untitled',
        content: data.content,
        excerpt: data.seoDescription || data.content.replace(/<[^>]*>/g, '').slice(0, 150),
        cover_image: data.coverImage,
        seo_title: data.seoTitle,
        seo_description: data.seoDescription,
        is_draft: false,
        tags: data.tags || [],
      };

      await createPost(postData);
      toast.success('Blog published successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to publish post:', error);
      toast.error('Failed to publish post');
    }
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <BlogEditor onSave={handleSave} onPublish={handlePublish} />
      </div>
    </PageTransition>
  );
}
