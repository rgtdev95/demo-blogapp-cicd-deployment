import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Zap, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';

const features = [
  {
    icon: Sparkles,
    title: 'Beautiful Editor',
    description: 'Write with a distraction-free editor designed for creativity.'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance that keeps up with your thoughts.'
  },
  {
    icon: Shield,
    title: 'Always Saved',
    description: 'Never lose your work with automatic draft saving.'
  },
  {
    icon: Users,
    title: 'Built for Writers',
    description: 'Focus on what matters - your words and ideas.'
  }
];

const sampleBlogs = [
  {
    title: 'The Art of Minimalist Design',
    excerpt: 'Exploring how less can be more in modern web development...',
    image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=600&h=400&fit=crop',
    readTime: '8 min'
  },
  {
    title: 'TypeScript Best Practices',
    excerpt: 'Learn how to structure TypeScript codebases that scale...',
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&h=400&fit=crop',
    readTime: '12 min'
  },
  {
    title: 'Building Accessible Apps',
    excerpt: 'A comprehensive guide to creating inclusive experiences...',
    image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&h=400&fit=crop',
    readTime: '10 min'
  }
];

export default function Landing() {
  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 font-serif">
                Write without limits.
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                A modern blogging platform designed for writers who want to focus on their craft.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/signup">Get Started Free</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg px-8">
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-serif">
              Everything you need to write
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="lift hover:border-primary/50 transition-colors">
                    <CardContent className="pt-6">
                      <feature.icon className="h-10 w-10 mb-4 text-primary" />
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Sample Blogs Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-serif">
              Stories from our community
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {sampleBlogs.map((blog, index) => (
                <motion.div
                  key={blog.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="lift overflow-hidden hover:border-primary/50 transition-colors">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2 font-serif">{blog.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{blog.excerpt}</p>
                      <span className="text-xs text-primary">{blog.readTime} read</span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-sm">
                © 2024 Scribble. Built with ♥ for writers.
              </p>
              <div className="flex gap-6">
                <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
                <a href="#privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </a>
                <a href="#terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
