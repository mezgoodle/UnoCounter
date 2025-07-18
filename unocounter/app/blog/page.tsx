interface Post {
  id: number;
  title: string;
  content: string;
}

export default async function Page() {
  const posts: Post[] = await getPosts();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id} className="mb-4">
          <h2 className="text-xl font-bold">{post.title}</h2>
          <p>{post.content}</p>
        </li>
      ))}
    </ul>
  );
}

async function getPosts() {
  // Example: fetch posts from an API or database
  // Here, we return mock data for demonstration
  return [
    { id: 1, title: "First Post", content: "Hello World!" },
    { id: 2, title: "Second Post", content: "Another post." },
  ];
}
