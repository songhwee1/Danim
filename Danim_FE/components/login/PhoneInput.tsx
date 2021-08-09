import * as React from 'react';
import styled from 'styled-components/native';

const TextInput = styled.TextInput`
  border-color: gray;
  border-width: 1px;
  width: 65%;
  justify-content: center;
  align-items: center;
  marginLeft : 10px;
  borderTopLeftRadius: 5px;
  borderTopRightRadius: 5px;
  borderBottomLeftRadius: 5px;
  borderBottomRightRadius: 5px;
`;

interface Props {
  setterUserPhone: (value: string) => void;
}

const PhoneInput: React.FC<Props> = (props: Props) => {
  return (
    <TextInput
      placeholder=" 휴대폰 번호   예)01012345678 "
      keyboardType="numeric"
      placeholderTextColor="#2C3E50"
      onChangeText={value => props.setterUserPhone(value)}
    />
  );
};

export default PhoneInput;
