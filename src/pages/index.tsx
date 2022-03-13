import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page || null);

  const handleGetMorePosts = useCallback(async (): Promise<void> => {
    if (nextPage) {
      const response = await fetch(nextPage);
      const data = await response.json();

      setNextPage(data.next_page);
      setPosts(prevState => [...prevState, ...data.results]);
    }
  }, [nextPage]);

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <Header />

      <main className={commonStyles.container}>
        <div className={commonStyles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a key={post.uid}>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle || ''}</p>
                <div>
                  <FiCalendar />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'd LLL yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                  <FiUser />
                  <span>{post.data.author || 'Sem author'}</span>
                </div>
              </a>
            </Link>
          ))}
          {nextPage && (
            <button
              className={styles.postsLinks}
              onClick={handleGetMorePosts}
              type="button"
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const { results, next_page } = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  return {
    props: {
      postsPagination: { results, next_page },
    },
    revalidate: 60 * 60, // 1 hour
  };
};
