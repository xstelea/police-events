import * as React from 'react';
import ReactMapboxGl, { Feature, Layer, Marker } from 'react-mapbox-gl';

import { PolisenService } from './services/polisen.service';

const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1Ijoic3RlbGVhIiwiYSI6ImNqbHh2ZXhuYTBjcXozcXFkNG83bzJxbjgifQ.vLiMAwnyrAt9PsDHKAOJYw"
});

export interface IEventLocation {
  gps: string;
  name: string;
}

export interface IEvent {
  datetime: string;
  id: number;
  location: IEventLocation;
  name: string;
  summary: string;
  type: string;
  url: string;
}

interface ICluster {
  [key: string]: IEvent[]
}

interface IState {
  events: IEvent[];
  clusters: ICluster;
  status: number;
}

class App extends React.Component<{}, IState> {

  public state = {
    events: [],
    clusters: {},
    status: 0,
  }

  private polisenService = new PolisenService()

  public async componentWillMount() {
    const response = await this.polisenService.get();
    if (response.status === 200) {
      const events: IEvent[] = await response.json();
      const clusters = events.reduce((acc, curr: IEvent) => {
        if (acc[curr.location.name]) {
          acc[curr.location.name] = [...acc[curr.location.name], curr];
        } else {
          acc[curr.location.name] = [curr];
        }
        return acc;
      }, {})
      this.setState({events, clusters, status: response.status});
    }
  }

  public renderEvents() {
    return this.state.events.map((event: IEvent) =>
      <Feature
        key={event.id}
        coordinates={event.location.gps.split(',').reverse().map(position => +position)}
      />)
  }

  public renderClusters() {
    const clustersIds = Object.keys(this.state.clusters);
    const clusters = clustersIds.map((clusterId) => {
      const coordinates = this.state.clusters[clusterId][0].location.gps.split(',').reverse().map((position: string) => +position);
      return <Marker key={clusterId} coordinates={coordinates}><div>{clusterId}</div></Marker>
    });
    return clusters;
  }

  public render() {
    return (
      <Map
        zoom={[4]}
        center={[13.761983316761189, 57.51178356586493]}
        style="mapbox://styles/mapbox/light-v9"
        containerStyle={{
          height: "100vh",
          width: "100vw",
        }}>
          <Layer type="symbol" id="marker" layout={{ "icon-image": "marker-15" }}>
            {this.renderClusters()}
          </Layer>
      </Map>
    );
  }
}

export default App;
