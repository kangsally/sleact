import { Dispatch, SetStateAction, useCallback, useState, ChangeEvent } from 'react';

// 제네릭의 장점은 타입을 변수로 활용할 수 있음
type ReturnTypes<T> = [T, (e: ChangeEvent<HTMLInputElement>) => void, Dispatch<SetStateAction<T>>];

// 타입스크립트는 변수, 리턴값은 똑똑해서 추론하지만 매개변수는 추론을 잘 못해서 지정해줘야함
const useInput = <T>(initialData: T): ReturnTypes<T> => {
  const [value, setValue] = useState(initialData);
  const handler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue((e.target.value as unknown) as T);
  }, []);
  return [value, handler, setValue];
};

export default useInput;

// 아래 중복 코드를 위의 useInput 이라는 custom hook 으로 만듬

// const onChangeEmail = useCallback((e) => {
//   setEmail(e.target.value);
// }, [])

// const onChangeNickname = useCallback(() => {
//   setNickname(e.target.value);
// }, [])


// any 대신 ChangeEvent<HTMLInputElement>,
// e.target.value 대신 e.target.value as unknown as T를 넣으면 해결된다.