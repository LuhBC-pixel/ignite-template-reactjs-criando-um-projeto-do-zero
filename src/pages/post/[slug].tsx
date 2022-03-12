import { format } from 'date-fns';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { ptBR } from 'date-fns/locale';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const timeRead = post.data.content.reduce((acc, curr) => {
    const text = RichText.asText(curr.body).split(/<.+?>(.+?)<\/.+?>/g);

    const words = [];
    text.forEach(word => {
      word.split(' ').forEach(w => {
        words.push(w);
      });
    });

    const headingWords = curr.heading.split(' ');
    const sumArray = headingWords.length + words.length;

    const total = Math.ceil(sumArray / 200);

    return acc + total;
  }, 0);

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling.</title>
      </Head>
      <Header />

      <img
        src={post.data.banner.url}
        alt={post.data.title}
        className={styles.banner}
      />
      <main className={commonStyles.container}>
        <div className={commonStyles.posts}>
          <h1 className={styles.title}>{post.data.title}</h1>

          <div className={styles.info}>
            <FiCalendar />
            <time>{post.first_publication_date}</time>
            <FiUser />
            <span>{post.data.author}</span>
            <FiClock />
            <span>{`${timeRead} min`}</span>
          </div>

          {post.data.content.map(content => (
            <div key={content.heading} className={styles.content}>
              <h2>{content.heading}</h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asText(content.body),
                }}
              />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths<any> = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query('');
  const params = posts.results.map(post => post.uid);

  return {
    paths: params.map(param => ({
      params: {
        slug: param,
      },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post: Post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'd LLL yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};
