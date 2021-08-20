import React, { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet, ActivityIndicator, Picker, Dimensions, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
const key = '960bf03d37f84911b3a0e3f6cd4de94e';

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

export default function App() {
  const [isLoading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [values, setValues] = useState([]);
  const [county, setCounty] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    wait(2000).then(() => setRefreshing(false));
  }, [refreshing]);
  const [data, setData] = useState({
    "datasets": [
       {
        data: [
          "2",
        ],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`
      },
       {
        data: [
          "0",
        ],
      },
    ],
    labels: [
      "4/1/2020",
    ],
  });
    const chartConfig={
    backgroundColor: "#e26a00",
    backgroundGradientFrom: "#fb8c00",
    backgroundGradientTo: "#ffa726",
    decimalPlaces: 2, // optional, defaults to 2dp
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffa726"
    }
  }
  let lat = '';
  let long = '';
  let url='';
  useEffect(() => {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      setErrorMsg(
        'Oops, this will not work on Sketch in an Android emulator. Try it on your device!'
      );
    } else {
      (async () => {
        let { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
        }

        let location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude;
        long = location.coords.longitude;
        // console.log('location ',location.coords.longitude,location.coords.latitude);
        setLocation(location);
        url = `https://api.opencagedata.com/geocode/v1/json?key=${key}&q=${lat}%2C${long}&pretty=1`;
        // console.log('url ',url);
    fetch(url)
      .then((response) => response.json())
      .then((json) => {setCounty(json.results[0].components.county.replace('County','').trim().replace(' ','%20'))})
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
      
      })();
    }
  },[]);
  const convertToGraphData = (value) => {
    let labels = [];
    let patients = [];
    let deaths = [];
    value.forEach((value) => {
      labels.push(value['Most Recent Date'].replace('T00:00:00','').replace('2021-',''));
      patients.push(value['COVID-19 Positive Patients']);
      deaths.push(value['Total Count Deaths']);
    })
    let newData = data;
    newData.labels = labels;
    newData.datasets = [{data : patients, color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})` },{data : deaths}];
    newData.legend= ["Positive", "Total Deaths"];
    setData(newData);
    // console.log(newData);
  }
  useEffect(() => {
    if (county !=''){
    setLoading(true);
    // console.log(county);
       //fetch(`https://data.chhs.ca.gov/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20%226cd8d424-dfaa-4bdd-9410-a3d656e1176e%22%20WHERE%20%22County%20Name%22%20LIKE%20%27${county}%27`)
       fetch(`https://covid19-values-data.herokuapp.com/${county}`)
      .then((response) => response.json())
      .then((json) => {console.log('got result ',json);setValues(json.records);
      convertToGraphData(json.records);})
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }else{
    setLoading(false);
    setCounty('');
  }},[county]);
  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.container}>         
      <Picker
        selectedValue={county}
        style={{ height: 50, width: 150 }}
        onValueChange={(itemValue, itemIndex) => setCounty(itemValue)}
      >
        <Picker.Item label="" value=""/>
        <Picker.Item label="Alameda" value="Alameda"/>
        <Picker.Item label="Alpine" value="Alpine"/>
        <Picker.Item label="Amador" value="Amador"/>
        <Picker.Item label="Butte" value="Butte"/>
        <Picker.Item label="Calaveras" value="Calaveras"/>
        <Picker.Item label="Colusa" value="Colusa"/>
        <Picker.Item label="Contra Costa" value="Contra%20Costa"/>
        <Picker.Item label="Del Norte" value="Del%20Norte"/>
        <Picker.Item label="El Dorado" value="El%20Dorado"/>
        <Picker.Item label="Fresno" value="Fresno"/>
        <Picker.Item label="Glenn" value="Glenn"/>
        <Picker.Item label="Humboldt" value="Humboldt"/>
        <Picker.Item label="Imperial" value="Imperial"/>
        <Picker.Item label="Inyo" value="Inyo"/>
        <Picker.Item label="Kern" value="Kern"/>
        <Picker.Item label="Kings" value="Kings"/>
        <Picker.Item label="Lake" value="Lake"/>
        <Picker.Item label="Lassen" value="Lassen"/>
        <Picker.Item label="Los Angeles" value="Los%20Angeles"/>
        <Picker.Item label="Madera" value="Madera"/>
        <Picker.Item label="Marin" value="Marin"/>
        <Picker.Item label="Mariposa" value="Mariposa"/>
        <Picker.Item label="Mendocino" value="Mendocino"/>
        <Picker.Item label="Merced" value="Merced"/>
        <Picker.Item label="Modoc" value="Modoc"/>
        <Picker.Item label="Mono" value="Mono"/>
        <Picker.Item label="Monterey" value="Monterey"/>
        <Picker.Item label="Napa" value="Napa"/>
        <Picker.Item label="Nevada" value="Nevada"/>
        <Picker.Item label="Orange" value="Orange"/>
        <Picker.Item label="Placer" value="Placer"/>
        <Picker.Item label="Plumas" value="Plumas"/>
        <Picker.Item label="Riverside" value="Riverside"/>
        <Picker.Item label="Sacramento" value="Sacramento"/>
        <Picker.Item label="San Benito" value="San%20Benito"/>
        <Picker.Item label="San Bernardino" value="San%20Bernardino"/>
        <Picker.Item label="San Diego" value="San%20Diego"/>
        <Picker.Item label="San Francisco" value="San%20Francisco"/>
        <Picker.Item label="San Joaquin" value="San%20Joaquin"/>
        <Picker.Item label="San Luis Obispo" value="San%20Luis%20Obispo"/>
        <Picker.Item label="San Mateo" value="San%20Mateo"/>
        <Picker.Item label="Santa Barbara" value="Santa%20Barbara"/>
        <Picker.Item label="Santa Clara" value="Santa%20Clara"/>
        <Picker.Item label="Santa Cruz" value="Santa%20Cruz"/>
        <Picker.Item label="Shasta" value="Shasta"/>
        <Picker.Item label="Sierra" value="Sierra"/>
        <Picker.Item label="Siskiyou" value="Siskiyou"/>
        <Picker.Item label="Solano" value="Solano"/>
        <Picker.Item label="Sonoma" value="Sonoma"/>
        <Picker.Item label="Stanislaus" value="Stanislaus"/>
        <Picker.Item label="Sutter" value="Sutter"/>
        <Picker.Item label="Tehama" value="Tehama"/>
        <Picker.Item label="Trinity" value="Trinity"/>
        <Picker.Item label="Tulare" value="Tulare"/>
        <Picker.Item label="Tuolumne" value="Tuolumne"/>
        <Picker.Item label="Ventura" value="Ventura"/>
        <Picker.Item label="Yolo" value="Yolo"/>
        <Picker.Item label="Yuba" value="Yuba"/>
      </Picker>
      {isLoading ? <ActivityIndicator/> : (
        
        <View>
          {values.length == 0 ? <Text></Text> :
          <Text style={styles.paragraph}>
              <Text>Date: {(values[values.length - 1]['Most Recent Date']).replace('T00:00:00','')}</Text>{"\n"}
              <Text>Positive Patients: {values[values.length - 1]['COVID-19 Positive Patients']}</Text> {"\n"}
              <Text>Total Count Confirmed: {values[values.length - 1]['Total Count Confirmed']}</Text> {"\n\n"}
              <Text>Total Count Deaths: {values[values.length - 1]['Total Count Deaths']}</Text> {"\n"}
            </Text>  
          
        } 
        <LineChart
        data={data}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        labelColor={(opacity = 1) => `rgba(255, 255, 255, ${opacity})`}
        bezier
        fromZero
        verticalLabelRotation={70}
        xLabelsOffset={-15}
        hideLegend={false}
      />
      </View>
      )}
       
    </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    marginTop: Constants.statusBarHeight,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
