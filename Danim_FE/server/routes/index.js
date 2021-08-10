const express = require('express');
const router = express.Router();
const db = require('../config/db.js');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const convert = require('xml-js');
const xlsx = require('xlsx');
var fs = require('fs');
var request = require('request');
var thenRequest = require('then-request');
//create signature2
var CryptoJS = require('crypto-js');
dotenv.config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === 'production' ? '.env' : '.env.dev',
  ),
});
router.get('/api', (req, res) => {
  // console.log('detected');
  // res.json({data: 'this is index.'});
  db.query('SELECT * FROM user;', (err, result) => {
    if (!err) {
      res.send(result);
    } else {
      console.log(err);
    }
  });
});
router.post('/api/register', (req, res) => {
  const userName = req.body.userName;
  const userPhone = req.body.userPhone;
  const userCertify = req.body.userCertify;
  db.query(
    'INSERT INTO user(userName, userPhone, userCertify) VALUES(?,?,?)',
    [userName, userPhone, userCertify],
    (err, result) => {
      if (!err) {
        res.send({result: 'success'});
      } else {
        res.send({result: 'failed'});
      }
    },
  );
});
//이미지 업로드
const imgUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      //에러나면 server 밑에 imgCertification이라는 폴더 만들어주세요
      cb(null, 'imgCertification/');
    },
    filename: (req, file, cb) => {
      //업로드된 파일에서 파일속성 가져오기
      var extenstion = path.extname(file.originalname);
      //.jpg만 뺀 나머지를 basename으로 지정
      var basename = path.basename(file.originalname, extenstion);
      //파일명 설정
      cb(null, basename + extenstion);
    },
  }),
});
router.post('/api/upload', imgUpload.single('fileData'), (req, res) => {
  console.log('업로드한다!!!!!!');
  console.log(req.file); //this will be automatically set by multer
  console.log(req.body);
  //below code will read the data from the upload folder. Multer
  //will automatically upload the file in that folder with an  autogenerated name
  fs.readFile(req.file.path, (err, contents) => {
    if (err) {
      console.log('Error: ', err);
    } else {
      console.log('File contents ', contents);
    }
  });
});
router.post('/api/login', (req, res) => {
  const userPhone = req.body.userPhone;
  db.query(
    'SELECT COUNT(*) FROM user WHERE userPhone = ?',
    [userPhone],
    (err, result) => {
      if (!err) {
        if (result[0]['COUNT(*)'] >= 1) {
          res.send({result: 'success', userPhone: userPhone});
        } else {
          res.send({result: 'failed'});
        }
      } else {
        res.send({result: 'failed'});
      }
    },
  );
});
router.post('/api/post/sms', (req, res) => {
  const userPhone = req.body.userPhone;
  const certiNumber = Math.floor(Math.random() * 100000) + 10000;
  var resultCode = 404;
  const date = Date.now().toString();
  const uri = process.env.SERVICE_ID; //서비스 ID
  const secretKey = process.env.NCP_SECRET_KEY; // Secret Key
  const accessKey = process.env.NCP_KEY; //Access Key
  const method = 'POST';
  const space = ' ';
  const newLine = '\n';
  const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
  const url2 = `/sms/v2/services/${uri}/messages`;
  const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
  hmac.update(method);
  hmac.update(space);
  hmac.update(url2);
  hmac.update(newLine);
  hmac.update(date);
  hmac.update(newLine);
  hmac.update(accessKey);
  const hash = hmac.finalize();
  const signature = hash.toString(CryptoJS.enc.Base64);
  request(
    {
      method: method,
      json: true,
      uri: url,
      headers: {
        'Contenc-type': 'application/json; charset=utf-8',
        'x-ncp-iam-access-key': accessKey,
        'x-ncp-apigw-timestamp': date,
        'x-ncp-apigw-signature-v2': signature,
      },
      body: {
        type: 'SMS',
        countryCode: '82',
        from: process.env.PHONE_NUM,
        content: `[DANIM] 회원가입 인증번호 [${certiNumber}] 입니다.`,
        messages: [
          {
            to: `${userPhone}`,
          },
        ],
      },
    },
    function (err, res, html) {
      if (err) {
        console.log(err);
      } else {
        console.log(html);
        console.log('CRTI COUNT : ', certiNumber);
      }
    },
  );
  res.json({
    code: 200,
    certiNumber: certiNumber,
  });
});
router.post('/api/chkDuplicate', (req, res) => {
  const userPhone = req.body.userPhone;
  db.query(
    'SELECT COUNT(*) FROM user WHERE userPhone = ?',
    [userPhone],
    (err, result) => {
      if (!err) {
        if (result[0]['COUNT(*)'] < 1) {
          res.send({result: 'success'});
        } else {
          res.send({result: 'failed'});
        }
      } else {
        res.send({result: 'failed'});
      }
    },
  );
});
router.post('/api/busstop', (req, res) => {
  console.log('REQBODY : ', req.body);
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  var url =
    'http://openapi.tago.go.kr/openapi/service/BusSttnInfoInqireService/getCrdntPrxmtSttnList';
  var queryParams =
    '?' +
    encodeURIComponent('ServiceKey') +
    `=${process.env.API_SERVICEKEY}`; /* Service Key*/
  queryParams +=
    '&' +
    encodeURIComponent('gpsLati') +
    '=' +
    encodeURIComponent(String(latitude)); /* */
  queryParams +=
    '&' +
    encodeURIComponent('gpsLong') +
    '=' +
    encodeURIComponent(String(longitude)); /* */
  request(
    {
      url: url + queryParams,
      method: 'GET',
    },
    function (error, response, body) {
      // console.log('Status', response.statusCode);
      // console.log('Headers', JSON.stringify(response.headers));
      // console.log('Reponse received', body);
      var xmlToJson = convert.xml2json(body, {compact: true, spaces: 4});
      var obj = JSON.parse(xmlToJson);
      // console.log('XMLTOJSON : ', obj.response.body.items.item);
      if (obj.response.body.items.item) {
        res.send({result: 'success', body: obj.response.body.items.item});
      } else {
        console.log('ITEM NOT FOUND');
        url = 'http://ws.bus.go.kr/api/rest/stationinfo/getStationByPos';
        queryParams =
          '?' +
          encodeURIComponent('ServiceKey') +
          `=${process.env.API_SERVICEKEY}`; /* Service Key*/
        queryParams +=
          '&' +
          encodeURIComponent('tmX') +
          '=' +
          encodeURIComponent(String(longitude)); /* */
        queryParams +=
          '&' +
          encodeURIComponent('tmY') +
          '=' +
          encodeURIComponent(String(latitude)); /* */
        queryParams +=
          '&' +
          encodeURIComponent('radius') +
          '=' +
          encodeURIComponent('1000'); /* */
        request(
          {
            url: url + queryParams,
            method: 'GET',
          },
          function (error, response, body) {
            //console.log('Status', response.statusCode);
            //console.log('Headers', JSON.stringify(response.headers));
            xmlToJson = convert.xml2json(body, {compact: true, spaces: 4});
            obj = JSON.parse(xmlToJson);
            // console.log('result : ', obj.ServiceResult.msgBody.itemList);
            res.send({
              result: 'failed',
              body: obj.ServiceResult.msgBody.itemList,
            });
          },
        );
      }
    },
  );
});
router.post('/api/post/changePhone', (req, res) => {
  const userPhone = req.body.userPhone;
  const chngUserPhone = req.body.chngUserPhone;
  db.query(
    'UPDATE user SET userPhone = ? WHERE userPhone = ?',
    [chngUserPhone, userPhone],
    (err, result) => {
      if (!err) {
        res.send({result: '200'});
      } else {
        res.send({result: '404'});
      }
    },
  );
});
router.get('/api/getWholeBus', (req, res) => {
  const locArr = ['12', '22', '23', '24'];
  const busArr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let retArr = [];
  // var itemsProcessed = 0;
  // locArr.forEach(item => {
  //   var tempCount = 0;
  //   busArr.forEach(busItem => {
  //     // 01.
  //     var url =
  //       'http://openapi.tago.go.kr/openapi/service/BusRouteInfoInqireService/getRouteNoList';
  //     var queryParams =
  //       '?' +
  //       encodeURIComponent('ServiceKey') +
  //       `=${process.env.API_SERVICEKEY}`; /* Service Key*/
  //     queryParams +=
  //       '&' +
  //       encodeURIComponent('cityCode') +
  //       '=' +
  //       encodeURIComponent(item); /* */
  //     queryParams +=
  //       '&' +
  //       encodeURIComponent('routeNo') +
  //       '=' +
  //       encodeURIComponent(busItem); /* */
  //     thenRequest('GET', url + queryParams)
  //       .getBody('utf8')
  //       .done(result => {
  //         // console.log(result);
  //         var xmlToJson = convert.xml2json(result, {compact: true, spaces: 4});
  //         var obj = JSON.parse(xmlToJson);
  //         if (obj.response.body.items !== undefined) {
  //           obj.response.body.items.item.forEach(value => {
  //             retArr.push(value);
  //           });
  //           tempCount++;
  //           if (tempCount === busArr.length) {
  //             itemsProcessed++;
  //             console.log('INSIDE : ', retArr);
  //             res.send({result: 'success', body: retArr});
  //           }
  //           if (itemsProcessed === locArr.length) {
  //             console.log('INSIDE : ', retArr);
  //             res.send({result: 'success', body: retArr});
  //           }
  //         }
  //       });
  //     // 02.
  //     // thenRequest(
  //     //   {
  //     //     url: url + queryParams,
  //     //     method: 'GET',
  //     //   },
  //     //   function (error, response, body) {
  //     //     var xmlToJson = convert.xml2json(body, {compact: true, spaces: 4});
  //     //     var obj = JSON.parse(xmlToJson);
  //     //     // console.log(obj.response.body.items);
  //     //     // retArr.push(obj.response.body.items.item);
  //     //     obj.response.body.items.item.forEach(value => {
  //     //       retArr.push(value);
  //     //     });
  //     //     console.log(retArr);
  //     //   },
  //     // ).done(function (dd) {
  //     //   console.log('RES : ', dd);
  //     // });
  //     // console.log('OUTSIDE : ', retArr);
  //   });
  // });
  // console.log('OUTSIDE : ', retArr);
  // eslint-disable-next-line no-path-concat
  const excelFile = xlsx.readFile(__dirname + '/lowbus.xlsx');
  // @breif 엑셀 파일의 첫번째 시트의 정보를 추출
  const sheetName = excelFile.SheetNames[0]; // @details 첫번째 시트 정보 추출
  const firstSheet = excelFile.Sheets[sheetName]; // @details 시트의 제목 추출
  // @details 엑셀 파일의 첫번째 시트를 읽어온다.
  const jsonData = xlsx.utils.sheet_to_json(firstSheet, {defval: ''});
  jsonData.map(item => {
    retArr.push(item);
  });
  res.send({result: 'success', body: retArr});
});

router.post('/api/post/getSelBusStop', (req, res) => {
  const busNumber = req.body.busNumber;
  console.log('BUSNUMBER : ', busNumber);
  var url = 'http://ws.bus.go.kr/api/rest/busRouteInfo/getBusRouteList';
  var queryParams =
    '?' +
    encodeURIComponent('ServiceKey') +
    `=${process.env.API_SERVICEKEY}`; /* Service Key*/
  queryParams +=
    '&' +
    encodeURIComponent('strSrch') +
    '=' +
    encodeURIComponent(busNumber); /* */

  request(
    {
      url: url + queryParams,
      method: 'GET',
    },
    function (error, response, body) {
      //console.log('Status', response.statusCode);
      //console.log('Headers', JSON.stringify(response.headers));
      // console.log('Reponse received', body);
      var xmlToJson = convert.xml2json(body, {compact: true, spaces: 4});
      var obj = JSON.parse(xmlToJson);

      // console.log(
      //   'obj : ',
      //   obj.ServiceResult.msgBody.itemList[0].busRouteId._text,
      // );

      if (
        obj.ServiceResult.msgBody.itemList[0].busRouteId._text !== undefined
      ) {
        var url = 'http://ws.bus.go.kr/api/rest/busRouteInfo/getStaionByRoute';
        var queryParams =
          '?' +
          encodeURIComponent('ServiceKey') +
          `=${process.env.API_SERVICEKEY}`; /* Service Key*/
        queryParams +=
          '&' +
          encodeURIComponent('busRouteId') +
          '=' +
          encodeURIComponent(
            obj.ServiceResult.msgBody.itemList[0].busRouteId._text,
          ); /* */

        request(
          {
            url: url + queryParams,
            method: 'GET',
          },
          function (error, response, body) {
            //console.log('Status', response.statusCode);
            //console.log('Headers', JSON.stringify(response.headers));
            //console.log('Reponse received', body);
            var xmlToJson = convert.xml2json(body, {compact: true, spaces: 4});
            var obj = JSON.parse(xmlToJson);
            console.log(obj.ServiceResult.msgBody.itemList);
          },
        );
      }
    },
  );
});

router.get('/api/getWholeStop', (req, res) => {
  var url = 'http://ws.bus.go.kr/api/rest/stationinfo/getLowStationByName';
  var queryParams =
    '?' +
    encodeURIComponent('ServiceKey') +
    `=${process.env.API_SERVICEKEY}`; /* Service Key*/
  queryParams +=
    '&' + encodeURIComponent('stSrch') + '=' + encodeURIComponent(''); /* */

  request(
    {
      url: url + queryParams,
      method: 'GET',
    },
    function (error, response, body) {
      //console.log('Status', response.statusCode);
      //console.log('Headers', JSON.stringify(response.headers));
      //console.log('Reponse received', body);
      var xmlToJson = convert.xml2json(body, {compact: true, spaces: 4});
      var obj = JSON.parse(xmlToJson);
      // console.log(obj.ServiceResult.msgBody.itemList);
      res.send({result: 'success', body: obj.ServiceResult.msgBody.itemList});
    },
  );
});

router.post('/api/post/getSelBus', (req, res) => {
  var stationNum = req.body.busNumber;
  // console.log('STATIONNUM : ', stationNum);
  var url = 'http://ws.bus.go.kr/api/rest/stationinfo/getLowStationByUid';
  var queryParams =
    '?' +
    encodeURIComponent('ServiceKey') +
    `=${process.env.API_SERVICEKEY}`; /* Service Key*/
  queryParams +=
    '&' +
    encodeURIComponent('arsId') +
    '=' +
    encodeURIComponent(stationNum); /* */

  request(
    {
      url: url + queryParams,
      method: 'GET',
    },
    function (error, response, body) {
      //console.log('Status', response.statusCode);
      //console.log('Headers', JSON.stringify(response.headers));
      //console.log('Reponse received', body);
      var xmlToJson = convert.xml2json(body, {compact: true, spaces: 4});
      var obj = JSON.parse(xmlToJson);
      console.log(obj.ServiceResult.msgBody.itemList);
      if (obj.ServiceResult.msgBody.itemList !== undefined) {
        res.send({result: 'success', body: obj.ServiceResult.msgBody.itemList});
      } else {
        res.send({result: 'success', body: 'None'});
      }
    },
  );
});

module.exports = router;
