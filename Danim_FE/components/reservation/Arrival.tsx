import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import {Picker} from '@react-native-picker/picker';


class ArrivalPicker extends Component{

    styles = StyleSheet.create({
        stopPicker: {
            width: '80%',
            marginLeft: 20,
            marginBottom: 20,
        },
        stopText: {
            fontSize: 18,
        }
    });

    state = {
        stop:'정류장을 선택해주세요.'
    }

    render(){
        return (
            <View>
                <Picker
                    style={this.styles.stopPicker}
                    selectedValue={this.state.stop}
                    onValueChange={(val,idx)=>
                        this.setState({stop:val})
                    }
		>
                    <Picker.Item style={this.styles.stopText} label="정류장을 선택해주세요." value="arrival"/>
                    <Picker.Item label="숙대입구역" value="a"/>
                    <Picker.Item label="남영우체국" value="b"/>
                    <Picker.Item label="남영동주민센터" value="c"/>
                </Picker>
            </View>
        )
    }
}
export default ArrivalPicker; 
