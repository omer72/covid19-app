import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

const LocationApiKey = '94b8f4ed053445bcaeb9a015137d6abd';
const herokuAppUrl = 'https://covid19-values-data.herokuapp.com';
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
const noDataAvailable = 'No Data available yet for the current location......';
const screenWidth = Dimensions.get("window").width;
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

export default function App() {
  const [isLoading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [values, setValues] = useState([]);
  const [county, setCounty] = useState('Alameda');
  const [countyList, setCountyList] = useState([<Picker.Item key= '0' label='' value=''/>]);
  const [data, setData] = useState({
    "datasets": [
       {
        data: []
      }
    ],
    labels: [],
  });

  // Get counties list from API and generate Picker Item list
  useEffect(() => {
    fetch(`${herokuAppUrl}/counties`)
        .then((response) => response.json())
        .then((json) => {
          setCountyList(json.map((county,i) =>{
            return <Picker.Item key={i} value={county.value} label={county.label} />
          })
        )})
  },[])

  // get location of device and get current county according to lat/lon
  useEffect(() => {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
        } else {
          const location = await Location.getCurrentPositionAsync({});
          const lat = location.coords.latitude;
          const long = location.coords.longitude;
          const url = `https://api.opencagedata.com/geocode/v1/json?key=${LocationApiKey}&q=${lat}%2C${long}&pretty=1`;
          fetch(url)
              .then((response) => response.json())
              .then((json) => {
                if (json.results[0].components.county) {
                    setCounty(json.results[0].components.county.replace('County', '').trim().replace(' ', '_'))
                }
              })
              .catch((error) => console.error(error))
              .finally(() => setLoading(false));
        }
      })();
  },[]);

  const convertToGraphData = (values) => {
    let labels = [];
    let patients = [];
    let deaths = [];
    if (values !== undefined){
        values.forEach((value) => {
          labels.push(value['Most Recent Date'].replace('2021-',''));
          patients.push(value['COVID-19 Positive Patients']);
          deaths.push(value['Deaths']);
        })
    } else {
      setErrorMsg(noDataAvailable);
    }
    const newData = values;
    newData.labels = labels;
    newData.datasets = [{data : patients, color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})` },{data : deaths}];
    newData.legend= ["Positive", "Deaths"];
    setData(newData);
  }
  useEffect(() => {
    if (county !== ''){
        setLoading(true);
       //fetch(`https://data.chhs.ca.gov/api/3/action/datastore_search_sql?sql=SELECT%20*%20from%20%226cd8d424-dfaa-4bdd-9410-a3d656e1176e%22%20WHERE%20%22County%20Name%22%20LIKE%20%27${county}%27`)
       fetch(`${herokuAppUrl}/${county}`)
      .then((response) => response.json())
      .then((json) => {
        setValues(json.records);
        convertToGraphData(json.records)
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
    } else {
        setLoading(false);
        setCounty('');
  }},[county]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <Picker
            selectedValue={county}
            style={{ height: 50, width: 150 }}
            onValueChange={(itemValue) => setCounty(itemValue)}
          >
            {countyList}
          </Picker>

          {isLoading ? <ActivityIndicator/> : (
            <View>
              {(!values || values.length === 0) ?
                  <Text>{errorMsg}</Text> :
                  <Text style={styles.paragraph}>
                      <Text>Date: {(values[values.length - 1]['Most Recent Date']).replace('T00:00:00','')}</Text>{"\n"}
                      <Text>Positive Patients: {values[values.length - 1]['COVID-19 Positive Patients']}</Text> {"\n"}
                      <Text>Total Count Confirmed: {values[values.length - 1]['Total Count Confirmed']}</Text> {"\n\n"}
                      <Text>Deaths: {values[values.length - 1]['Deaths']}</Text> {"\n"}
                    </Text>
              }
              <LineChart
                  data={data}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  labelColor={(opacity = 0.9) => `rgba(255, 255, 255, ${opacity})`}
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

