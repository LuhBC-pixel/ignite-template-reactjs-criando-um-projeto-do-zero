import { format } from 'date-fns';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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

interface Content {
  heading: string;
  body: {
    text: string;
  }[];
}

export default function Post({ post }: PostProps) {
  const words = post.data.content.map(content => {
    const headigWordsArray = content.heading.split(' ');
    const bodyTextWordsArray = content.body.map(body => body.text.split(' '));

    return [...headigWordsArray, ...bodyTextWordsArray];
  });

  const wordsTotal = words.length + 1;

  const wordsPersonReadPerMinute = 200;

  const timeRead = (wordsTotal / wordsPersonReadPerMinute).toFixed();

  return (
    <>
      <Header />

      <main className={commonStyles.container}>
        <div className={styles.post}>
          <img src={post.data.banner.url} alt={post.data.title} />
          <h1>{post.data.title}</h1>
          <div>
            <FiCalendar />
            <time>{post.first_publication_date}</time>
            <FiUser />
            <p>{post.data.author}</p>
            <FiClock />
            <p>{`${timeRead} min`}</p>
          </div>

          {post.data.content.map(content => (
            <div key={content.heading}>
              <h2>{content.heading}</h2>
              {content.body.map(body => (
                <p key={body.text}>{body.text}</p>
              ))}
              <hr />
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
  const paths = posts.results.map(post => ({
    params: post.slugs,
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const content = response.data.content.map((content: Content) => ({
    heading: content.heading,
    body: content.body.map(body => ({
      text: RichText.asText(body.text),
    })),
  }));

  const posts = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'd LLL yyyy'
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: content,
    },
  };

  return {
    props: {
      posts,
    },
  };
};
