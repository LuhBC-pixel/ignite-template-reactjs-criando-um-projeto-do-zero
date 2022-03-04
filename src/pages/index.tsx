import { GetStaticProps } from 'next';
import Head from 'next/head';

import { getPrismicClient } from '../services/prismic';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiCalendar, FiUser } from 'react-icons/fi';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom';

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
  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <img src="/Logo.png" alt="logo" />

      {postsPagination.results?.map(post => (
        <div key={post.uid}>
          <span>{post.data.title}</span>
          <p>{post.data.subtitle}</p>
          <time>
            <FiCalendar />
            {post.first_publication_date}
          </time>
          <p>
            <FiUser />
            {post.data.author}
          </p>
        </div>
      ))}
      {postsPagination.next_page && <button>Carregar mais posts</button>}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query('');

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(new Date(), post.first_publication_date, {
        locale: ptBR,
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: posts,
    },
  };
};
