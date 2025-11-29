import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading2,
  Image as ImageIcon,
  X,
  Upload,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useState, useRef } from 'react';
import { uploadFile } from '@/api/upload';
import { toast } from 'sonner';

interface BlogEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialCoverImage?: string;
  initialTags?: string[];
  initialSeoTitle?: string;
  initialSeoDescription?: string;
  onSave: (data: {
    title: string;
    content: string;
    coverImage: string;
    tags: string[];
    seoTitle: string;
    seoDescription: string;
  }) => void;
  onPublish: (data: {
    title: string;
    content: string;
    coverImage: string;
    tags: string[];
    seoTitle: string;
    seoDescription: string;
  }) => void;
}

export function BlogEditor({
  initialTitle = '',
  initialContent = '',
  initialCoverImage = '',
  initialTags = [],
  initialSeoTitle = '',
  initialSeoDescription = '',
  onSave,
  onPublish,
}: BlogEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [coverImage, setCoverImage] = useState(initialCoverImage);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [seoTitle, setSeoTitle] = useState(initialSeoTitle);
  const [seoDescription, setSeoDescription] = useState(initialSeoDescription);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Tell your story...',
      }),
      Image,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4',
      },
    },
  });

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const response = await uploadFile(file);
      setCoverImage(response.url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const getData = () => ({
    title,
    content: editor?.getHTML() || '',
    coverImage,
    tags,
    seoTitle: seoTitle || title,
    seoDescription: seoDescription || editor?.getText().slice(0, 160) || '',
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Main Editor */}
      <div className="flex-1 space-y-6">
        {/* Cover Image */}
        <div>
          <Label>Cover Image</Label>
          <div className="flex gap-4 mt-2">
            <div className="flex-1">
              <Input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>
          {coverImage && (
            <div className="relative mt-4 group">
              <img
                src={coverImage}
                alt="Cover"
                className="rounded-lg w-full h-48 object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setCoverImage('')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Your awesome title..."
            className="text-4xl font-bold font-serif border-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Toolbar */}
        {editor && (
          <div className="flex flex-wrap gap-1 p-2 border rounded-lg bg-muted/30">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-primary text-primary-foreground' : ''}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-primary text-primary-foreground' : ''}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-8 mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading') ? 'bg-primary text-primary-foreground' : ''}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'bg-primary text-primary-foreground' : ''}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive('blockquote') ? 'bg-primary text-primary-foreground' : ''}
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={editor.isActive('codeBlock') ? 'bg-primary text-primary-foreground' : ''}
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Content Editor */}
        <div className="border rounded-lg p-4 min-h-[500px] bg-card">
          <EditorContent editor={editor} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pb-8">
          <Button type="button" variant="outline" onClick={() => onSave(getData())}>
            Save Draft
          </Button>
          <Button type="button" onClick={() => onPublish(getData())}>
            Publish
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 space-y-6">
        <div className="space-y-4 border rounded-lg p-4">
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Press Enter to add"
              className="mt-2"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <Label htmlFor="seo-title">SEO Title</Label>
            <Input
              id="seo-title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Optional custom SEO title"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {seoTitle.length}/60 characters
            </p>
          </div>

          <div>
            <Label htmlFor="seo-desc">SEO Description</Label>
            <Textarea
              id="seo-desc"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Optional custom SEO description"
              className="mt-2"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {seoDescription.length}/160 characters
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
