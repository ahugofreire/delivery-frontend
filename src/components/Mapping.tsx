import { Grid, MenuItem, Select, Button, makeStyles } from "@material-ui/core";
import { Loader } from "google-maps";
import {
  FormEvent,
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { sample, shuffle } from "lodash";
import { getCurrentPosition } from "../utils/geolocations";
import { makeCarIcon, makeMarkerIcon, Map } from "../utils/maps";
import { Route } from "../utils/models";
import { RouteExitsError } from "../errors/route-exits.error";
// import { useSnackbar } from "notistack";
import { NavBar } from "./NavBar";
import io from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL as string;
const googleMapsLoader = new Loader(process.env.REACT_APP_GOOGLE_API_KEY);

const colors = [
  "#b71c1c",
  "#4a148c",
  "#2e7d32",
  "#e65100",
  "#2692ff",
  "#c1285b",
  "#FFCD00",
  "#3e2723",
  "#03a9f4",
  "#827717"
];

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
  },
  form: {
    margin: '16px'
  },
  btnSubmitWrapper: {
    textAlign: 'center',
    marginTop: '8px',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export const Mapping: FunctionComponent = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeIdSelected, setRouteIdSelected] = useState<string>("");
  const mapRef = useRef<Map>();
  const socketIORef = useRef<any>();
  // const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  useEffect(() => {
    socketIORef.current = io.connect(API_URL);
    socketIORef.current.on('connect', () => console.log("Connected....."));
    socketIORef.current?.on(
      "new-position",
      (data: {
        routeId: string;
        position: [number, number];
        finished: boolean;
      }) => {
        mapRef.current?.moveCurrentMarker(data.routeId, {
          lat: data.position[0],
          lng: data.position[1],
        });
      }
    )
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/routes`)
    .then((data) => data.json())
    .then((data) => setRoutes(data));
  }, []);

  useEffect(() => {
    (async () => {
      const [, position] = await Promise.all([
        googleMapsLoader.load(),
        getCurrentPosition({ enableHighAccuracy: true}),
      ]);

      const divMap = document.getElementById('map') as HTMLElement;
      mapRef.current = new Map(divMap, {
        zoom: 15,
        center: position,
      });

    })();
  },[]);

  const startRoute = useCallback((event: FormEvent) => {
    event.preventDefault();
    const route = routes.find(route => route._id === routeIdSelected);
    const color = sample(shuffle(colors)) as string;

    try {
      mapRef.current?.addRoute( routeIdSelected, {
        currentMarkerOptions: {
          position: route?.startPosition,
          icon: makeCarIcon(color),
        },
        endMarkerOptions: {
          position: route?.endPosition,
          icon: makeMarkerIcon(color)
        },
      });

      console.log("Está aqui!!!!!!!!!!!!!!!!!")
      // socketIORef.current?.emit('new-direction', {
      //   routeId: routeIdSelected,
      // });
    } catch (error) {
      if (error instanceof RouteExitsError) {
        console.log("Está com Error")
        // enqueueSnackbar(`${route?.title} já adicionado, espere finalizar.`, {
        //   variant: 'error',
        // });
        return;
      }
      throw error;
    }


  }, [routeIdSelected, routes, ]);

  return (
    <Grid className={classes.root}>
      <Grid item xs={12} sm={3}>
        <NavBar />
       <form onSubmit={startRoute} className={classes.form}>
        <Select
          fullWidth
          displayEmpty
          value={routeIdSelected}
          onChange={(event) => setRouteIdSelected(event.target.value + "")}
        >
          <MenuItem value="">
            <em>Selecione uma corrida</em>
          </MenuItem>
          {
            routes.map((route, key) => (
              <MenuItem key={key} value={route._id}>
              {route.title}
            </MenuItem>
            ))
          }
        </Select>
        <div className={classes.btnSubmitWrapper}>
        <Button
          type="submit"
          color="primary"
          variant="contained"
        >
          Iniciar uma Corrida
        </Button>
        </div>
       </form>
      </Grid>

      <Grid item xs={12} sm={9}>
        <div id="map" style={{ width: '100%', height: '100%'}} />
      </Grid>
    </Grid>
  );
};
