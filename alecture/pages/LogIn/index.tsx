import useInput from '@hooks/useInput';
import { Success, Form, Error, Label, Input, LinkContainer, Button, Header } from '@pages/SignUp/styles';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import useSWR from 'swr'; // 주로 get 요청에 사용한다.
// 아래 mutate 대신에 import useSWR, {mutate} from 'swr'; 로 사용할 수 있다. 이 경우 렌더링 될때 한번 요청되는것을 방지하므로 유용하다.

const LogIn = () => {
  const { data, error, revalidate, mutate, } = useSWR('/api/users', fetcher); // 이때 꼭 '/api/users' api 주소를 넣어주어야한다.
  // data 가 존재하지 않으면 loading 상태로 표현
  // 다른 탭(윈도우) 갔다가 오면 자동적으로 요청을 한번 더 보냄
  // swr은 요청방법을 커스터마이징할 수 있다!
  // client 와 server 의 url 이 다르면 server 에서 만들어 줄 수도 없고 client에서 서버로 보낼 수도 없다.
  // withCredentials: true를 해줘야 쿠키 저장이 가능하다. (axios 의 설정에)
  // reactQuesry와 swr이 비슷한 기능을 함
  // graph ql 과 apollo 사용하면 이건 필요없음
  // 주기적으로 호출 되지만 dedupingInterval 기간 내에서는 캐시에서 불러온다.
  // useSWR('/api/users', fetcher, { dedupingInterval: 5000}); 캐시 유지 기간이 2초 (첫번째 요청 후 5초 이내 다시 요청된건 무시한다)
  // SWR은 get요청에 가장 유리하지만 post 등 다른 것도 가능하며, 데이터를 가져와서 유지해준다는 사실이 중요함
  // swr 로 꼭 api 요청분만 아니라 loacalstorage setItem, getItem 등도 가능함.
  // 말단 컴포넌트 일수록 memo 를 잘 사용한다.
  // fetcher 를 다양하게 만들어서 사용하자
  // 만약 같은 주소에 다른 fetcher 를 사용하고 싶은 경우 아래와 같이 쓸 수 있다.
  // userSWR('/api/users', fetcher);
  // userSWR('/api/users#123', fetcher2); (꼼수같은 방법)

  const [logInError, setLogInError] = useState(false);
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');
  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setLogInError(false);
      axios
        .post(
          '/api/users/login',
          { email, password },
          {
            withCredentials: true,
          },
        )
        .then((response) => {
          revalidate(); // fetcher가 실행됨 -> revalidate를 mutate로 바꾸면 서버에 요청하는 대신 기존에 가지고 있던 데이터를 넣어줌
          // mutate(response.data, true); -> Optimistic UI => 인스타에서 좋아요 눌렀을때 서버에 보내기 전에 하트 숫자를 늘려주는 것
          // 서버에 요청이 성공할 것이라고 예상하고 진행하는 것을 Optimistic UI라고 한다.
        })
        .catch((error) => {
          setLogInError(error.response?.data?.statusCode === 401);
        });
    },
    [email, password],
  );

  if (data === undefined) {
    return <div>로딩중...</div>;
  }

  if (data) {
    return <Redirect to="/workspace/sleact/channel/일반" />;
  }

  // console.log(error, userData);
  // if (!error && userData) {
  //   console.log('로그인됨', userData);
  //   return <Redirect to="/workspace/sleact/channel/일반" />;
  // }

  return (
    <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
          {logInError && <Error>이메일과 비밀번호 조합이 일치하지 않습니다.</Error>}
        </Label>
        <Button type="submit">로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?&nbsp;
        <Link to="/signup">회원가입 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default LogIn;
