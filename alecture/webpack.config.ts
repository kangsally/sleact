import path from 'path';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import webpack from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const isDevelopment = process.env.NODE_ENV !== 'production';

const config: webpack.Configuration = {
  name: 'sleact',
  mode: isDevelopment ? 'development' : 'production',
  devtool: !isDevelopment ? 'hidden-source-map' : 'eval', // eval 대신 inline-source-map 으로도 사용
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'], // babel이 처리할 확장자 목록
    alias: {
      '@hooks': path.resolve(__dirname, 'hooks'), // typescript 설정 파일에서도 설정해줘야하고 여기서도 해야함
      '@components': path.resolve(__dirname, 'components'), // 왜냐하면 typescript는 맞게 썼는지 검사하고
      '@layouts': path.resolve(__dirname, 'layouts'), // 여기서는 실제 바벨이 자바스크립트로 변환할때 참고 하기 떄문
      '@pages': path.resolve(__dirname, 'pages'),
      '@utils': path.resolve(__dirname, 'utils'),
      '@typings': path.resolve(__dirname, 'typings'),
    },
  },
  entry: {
    app: './client', // 메인 파일
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: { browsers: ['last 2 chrome versions'] }, // 최신 크롬버전 두개 지원하도록 알아서 바꿔줌
                debug: isDevelopment,
              },
            ],
            '@babel/preset-react', // react 돌아가게
            '@babel/preset-typescript', // 타입스크립트 돌아가게
          ],
          env: { 
            development: {
              plugins: [['@emotion', { sourceMap: true }], require.resolve('react-refresh/babel')], // react hot reloading 관련
            },
            production: {
              plugins: ['@emotion'],
            },
          },
        },
        exclude: path.join(__dirname, 'node_modules'),
      },
      {
        test: /\.css?$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({ // 타입스크립트와 웹팩 검사를 동시에 실행 할 수 있도록 (타입스크립트가 블록킹 식으로 검사하지 않도록)
      async: false,
      // eslint: {
      //   files: "./src/**/*",
      // },
    }),
    new webpack.EnvironmentPlugin({ NODE_ENV: isDevelopment ? 'development' : 'production' }), 
  ], // react 즉 에서 env 사용 가능하게 함 (원래는 backend만 가능) 
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/dist/',
  },
  devServer: {
    historyApiFallback: true, // react router할 때 필요한 설정 // 싱글페이지에서도 /주소 별로 인식할 수 있게 가짜 history를 만들어 주는 것
    port: 3090,
    publicPath: '/dist/', // 웹팩서버에서 돌아길때는 index.html에 ./dist가 아니라 /dist/로 적어주어야 함
    proxy: { // 프론트에서 api 라는 주소로 요청을 보낼때는 localhost 3095에서 보낸 것 처럼 하겠다 이렇게 설정하고
      '/api/': { // axois 에서 요청할때 앞에 http://locahost:3090/api/~~ 를 그냥 /api/~~ 로 바꾸면 locahothost:3095에서 보낸 것처럼 처리됨 cors 문제 해결 
        target: 'http://localhost:3095', // 같은 도메인이면 options 요청이 안보내진다, 다르면 options 요청이 먼저 가고 그다음 host를 보냄
        changeOrigin: true, //근데 이 설정은 프론트와 서버 둘다 local 에서 돌아갈 때만 효과가 있음
      },
    },
  },
};

// 개발환경일 때

if (isDevelopment && config.plugins) {
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
  config.plugins.push(new ReactRefreshWebpackPlugin());
  config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'server', openAnalyzer: true }));
}

// 개발환경 아닐 때
if (!isDevelopment && config.plugins) {
  config.plugins.push(new webpack.LoaderOptionsPlugin({ minimize: true }));
  config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static' }));
}

export default config;

// 핫 리로딩 관련: webpack-dev-server, webpack-cli, reactRefreshWebpackPlugin, react-refresh
// hotmodulereplacementplugin