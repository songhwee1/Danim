import React, {useState} from 'react';
import {Text, Alert, ImageBackground, View} from 'react-native';
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
import { StyleSheet } from 'react-native';
import {Button} from 'react-native-paper';

const Container = styled.View`
  justify-content: center;
  flex: 1;
`;

const styles = StyleSheet.create({
  Text: {
    fontSize: 15,
    margin: 10,
    marginLeft: 15,
    fontWeight: 'bold'
  },
  Button: {
    height: 40,
    backgroundColor: '#2C3E50',
    margin: 12,
    marginBottom: 0
  },
  ConfirmBotton: {
    backgroundColor: '#2C3E50',
    width: '30%',
    padding: 4
  },
  ButtonText: {
    fontSize: 15,
    color: '#FFFFFF'
  }
});

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
        } else if (isCertified === 'X') {
          // 인증번호 확인
          Alert.alert('인증번호 확인이 필요합니다.');
        } else {
          let getRegisterResult = await funcRegister({
            userName,
            userPhone,
            userCertify,
          });
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
      <Text style={styles.Text}>이름</Text>
      <NameInput setterUserName={setterUserName} />
      <Text style={styles.Text}>휴대폰 번호</Text>
      <PhoneInput setterUserPhone={setterUserPhone} />
      <Button
        style={styles.Button}
        onPress={doCheckDuplicate}>
          <Text style={styles.ButtonText}>회원정보 확인</Text>
          </Button>
      <Button
        style={styles.Button}
        onPress={doSMS}>
          <Text style={styles.ButtonText}>인증번호 전송</Text>
          </Button>
      <Text style={styles.Text}>인증번호</Text>
      <View style={{flexDirection: 'row'}}>
      <CertificationInput setterCertifyNumber={setterCertifyNumber} />
      <Button
        style={styles.ConfirmBotton}
        onPress={doCheckCertify}>
          <Text style={styles.ButtonText}>확인</Text>
          </Button>
      </View>
      <Text style={styles.Text}>장애인 증명서</Text>
      <View style={{alignItems: 'center'}}>
        <ImageBackground
          source={{uri: userCertify}}
          style={{width: 200, height: 40, alignItems: 'center'}}
          imageStyle={{borderRadius: 10}}
        />
      </View>
      <Button 
        style={styles.Button}
        onPress={() => {
          console.log('사진 선택하기');
          ImagePicker.openPicker({
            path: 'my-file-path.jpg',
            width: 400,
            height: 300,
            cropping: true,
          }).then(async image => {
            setImgPath(image.path);
            console.log('사진!!!!: ' + imgPath);
          });
        }}
      ><Text style={styles.ButtonText}>첨부</Text>
      </Button>
      <Text style={{fontSize: 15, textAlign: 'center', marginTop:8}}>
        관리자가 회원가입을 승인할 때까지 앱 사용이 제한됩니다.</Text>
      <Button
        style={styles.Button} 
        onPress={() =>
        {
          setUserCertify(userPhone+'_imgCertification.jpg')

          const data = new FormData();

          data.append('name', 'imgCertification');
          data.append('fileData', {
            uri: imgPath,
            type: 'image/jpeg', 
            name: userPhone+'_imgCertification.jpg'
          });

          const config = {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
            },
            body: data,
          };

          //ex) "http://10.200.52.60:5000/api/upload"
          fetch('http://ip 주소!!!!:5000/api/upload', config)
            .then(checkStatusAndGetJSONResponse => {
              console.log(checkStatusAndGetJSONResponse);
            })
            .catch(err => {
              console.log(err);
            });

            doRegister();
          }
        }>
          <Text style={styles.ButtonText}>완료</Text>
          </Button>
    </Container>
  );
};

export default Register;