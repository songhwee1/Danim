import React, {useState} from 'react';
import {Text, Button, Alert, ImageBackground, View} from 'react-native';
import NameInput from '../components/register/NameInput';
import PhoneInput from '../components/register/PhoneInput';
import {HomeScreens, HomeStackParamList} from '../navigators/index';
import {StackNavigationProp} from '@react-navigation/stack';
import {funcRegister} from '../function/funcRegister';
import styled from 'styled-components/native';
import ImagePicker from 'react-native-image-crop-picker';

//import ImagePicker from 'react-native-image-picker';
//import * as ImagePicker from 'react-native-image-picker';
import {funcPostSMS} from '../function/funcSendMessage';
import {funcCheckDuplicate} from '../function/funcCheckDuplicate';
import CertificationInput from '../components/register/CertificationInput';

const EmptyView = styled.View`
  flex: 0.05;
`;

const Container = styled.View`
  justify-content: center;
  flex: 1;
`;

type RegisterScreenNavigationProps = StackNavigationProp<
  HomeStackParamList,
  HomeScreens.Register
>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProps;
}

const Register: React.FunctionComponent<RegisterScreenProps> = props => {
  const {navigation} = props;
  const [userName, setUserName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');

  //인증서
  const [userCertify, setUserCertify] = useState<string>('');

  // 중복 여부 체크 - 초기 값은 중복 상태로 둔다.
  const [isDuplicate, setIsDuplicate] = useState<string>('O');
  // 인증번호
  const [certifyNumber, setCertifyNumber] = useState<string>('');
  // 사용자 입력 인증번호
  const [userCertifyNumber, setUserCertifyNumber] = useState<string>('');
  // 인증번호 체크 여부
  const [isCertified, setIsCertified] = useState<string>('X');

  // author : 차민재
  // username 입력 시 값 바인딩
  const setterUserName = (value: string) => {
    setUserName(value);
  };

  // userphone 입력 시 값 바인딩
  const setterUserPhone = (value: string) => {
    setUserPhone(value);
  };

  // 인증번호 입력 시 값 바인딩
  const setterCertifyNumber = (value: string) => {
    setUserCertifyNumber(value);
  };

  // 중복 전화번호 체크
  const doCheckDuplicate = async () => {
    try {
      if (userPhone === '') {
        Alert.alert('전화번호를 입력해주세요.');
      } else {
        let getDuplicateResult = await funcCheckDuplicate({userPhone});
        if (getDuplicateResult) {
          setIsDuplicate('X');
          Alert.alert('사용 가능한 전화번호 입니다.');
        } else {
          setIsDuplicate('O');
          Alert.alert('현재 사용 중인 전화번호 입니다.');
        }
      }
    } catch (e) {
      Alert.alert('오류 발생');
    }
  };

  // 인증번호 발송
  const doSMS = async () => {
    try {
      Alert.alert('인증번호 전송 완료');
      let getSMSResult = await funcPostSMS({userPhone});
      if (getSMSResult) {
        setCertifyNumber(getSMSResult);
      } else {
        Alert.alert('오류 발생');
      }
    } catch (e) {
      Alert.alert('오류 발생');
    }
  };

  // 사용자 입력 인증번호와 전송 된 인증번호가 같은지 비교
  const doCheckCertify = () => {
    // ' === ' 타입 체크 안하고 값만 체크
    // eslint-disable-next-line eqeqeq
    if (certifyNumber == userCertifyNumber) {
      setIsCertified('O');
      Alert.alert('인증번호 확인 완료');
    } else {
      setIsCertified('X');
      Alert.alert('인증번호를 확인해주세요.');
    }
  };

  // 회원가입
  const doRegister = async () => {
    try {
      // 데이터 검증 단계
      if (userName !== '' && userPhone !== '' && userCertify !== '') {
        if (isDuplicate === 'O') {
          // 중복 확인
          Alert.alert('중복 확인이 필요합니다.');
        // } else if (isCertified === 'X') {
        //   // 인증번호 확인
        //   Alert.alert('인증번호 확인이 필요합니다.');
        } else {
          let getRegisterResult = await funcRegister({userName, userPhone, userCertify});
          if (getRegisterResult) {
            Alert.alert('회원가입 성공');
            navigation.navigate(HomeScreens.RegisterWait);
          } else {
            Alert.alert('오류 발생');
          }
        }
      } else {
        Alert.alert('정보를 입력해주세요.');
      }
    } catch (e) {
      Alert.alert('오류 발생');
    }
  };

  const [imgPath, setImgPath] = useState<string>('');

  return (
    <Container>
      <Text>이름</Text>
      <NameInput setterUserName={setterUserName} />
      <EmptyView />
      <Text>휴대폰 번호</Text>
      <PhoneInput setterUserPhone={setterUserPhone} />
      <EmptyView />
      <Button
        onPress={doCheckDuplicate}
        color="#2C3E50"
        title="회원정보 확인"
      />
      <EmptyView />
      <Button onPress={doSMS} color="#2C3E50" title="인증번호 전송" />
      <EmptyView />
      <Text>인증번호</Text>
      <CertificationInput setterCertifyNumber={setterCertifyNumber} />
      <Button onPress={doCheckCertify} color="#2C3E50" title="확인" />
      <EmptyView />
      <Text>장애인 증명서</Text>
      <Text>userCertify: {userCertify}</Text>
      <Text>imgPath: {imgPath}</Text>
      <View
        style={{alignItems: 'center'}}>
        <ImageBackground
          source={{uri:imgPath}}
          style={{width: 200, height: 150, alignItems: 'center'}}
          imageStyle={{borderRadius: 10}} 
        />
      </View>
      <EmptyView />
      <EmptyView />
      <EmptyView />
      <EmptyView />
      <Button
        onPress={() => 
          {
            console.log('사진 선택하기')
            ImagePicker.openPicker({
              path: 'my-file-path.jpg',
              width: 400,
              height: 300,
              cropping: true
            }).then(image => {
              setUserCertify(userPhone+'_imgCertification.jpg');
              setImgPath(image.path);
              console.log("사진!!!!: " + image.path);    
              
              const data = new FormData();

              data.append('fileData', {
                type: 'image/jpeg', 
                uri: image.path, 
                name: userPhone+'_imgCertification.jpg',
                filename: userPhone+'_imgCertification.jpg'
              });
              
              console.log("데이터 생성!!!!: " + data);
              
              const config = {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'multipart/form-data',
                },
                body: data,
              };

              //ex) "http://10.200.52.60:5000/api/upload"
              fetch("http://ip주소!!!!!!!:5000/api/upload", config)
              .then((checkStatusAndGetJSONResponse)=>{       
                console.log(checkStatusAndGetJSONResponse);
              }).catch((err)=>{console.log(err)});
            });
          }
        }
        color="#2C3E50"
        title="첨부"
      />

      <Text>관리자가 회원가입을 승인할 때까지 앱 사용이 제한됩니다.</Text>
      <EmptyView />
      <EmptyView />
      <EmptyView />
      <Button onPress={doRegister} color="#2C3E50" title="완료" />
    </Container>
  );
};

export default Register;
