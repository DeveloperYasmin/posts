import { useState, useEffect } from 'react';
import Post from "@/components/Post";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { TPost } from "../types";

const getPosts = async (email: string, page: number = 1, pageSize: number = 10) => {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/authors/${email}?page=${page}&pageSize=${pageSize}`);
    const { posts } = await res.json();
    return posts;
  } catch (error) {
    return null;
  }
};

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<TPost[]>([]);

  if (!session) {
    redirect("/sign-in");
  }

  const fetchPosts = async () => {
    if (email) {
      const fetchedPosts = await getPosts(email, currentPage);
      setPosts(fetchedPosts);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage]); // Re-fetch posts when currentPage changes

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <h1>My Posts</h1>

      {posts && posts.length > 0 ? (
        <>
          {posts.map((post: TPost) => (
            <Post
              key={post.id}
              id={post.id}
              author={""}
              authorEmail={post.authorEmail}
              date={post.createdAt}
              thumbnail={post.imageUrl}
              category={post.catName}
              title={post.title}
              content={post.content}
              links={post.links || []}
            />
          ))}
          <div>
            <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
            <button onClick={nextPage}>Next</button>
          </div>
        </>
      ) : (
        <div className="py-6">
          No posts created yet.{' '}
          <Link href={'/create-post'}>
            <a className="underline">Create New</a>
          </Link>
        </div>
      )}
    </div>
  );
}
