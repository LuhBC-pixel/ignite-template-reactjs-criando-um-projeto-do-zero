export function Comment() {
  const script = document.createElement('script');
  const anchor = document.getElementById('comment-anchor');

  script.src = 'https://utteranc.es/client.js';
  script.setAttribute(
    'repo',
    'https://github.com/LuhBC-pixel/ignite-template-reactjs-criando-um-projeto-do-zero'
  );
  script.setAttribute('issue-term', 'pathname');
  script.setAttribute('label', 'blog-comment');
  script.setAttribute('theme', 'photon-dark');
  script.async = true;
  script.crossOrigin = 'anonymous';
  anchor.appendChild(script);

  return <div id="comment-anchor"></div>;
}
