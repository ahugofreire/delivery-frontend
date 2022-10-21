import { Grid, MenuItem, Select, Button } from "@material-ui/core";
import { Loader } from "google-maps";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Route } from "../utils/models";

const API_URL = process.env.REACT_APP_API_URL;
const googleMapsLoader = new Loader(process.env.REACT_APP_GOOGLE_API_KEY);

type Props = {

};
export const Mapping = (props: Props) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeIdSelected, setRouteIdSelected] = useState<string>("");
  const mapRef = useRef<google.maps.Map>();

  useEffect(() => {
    fetch(`${API_URL}/routes`)
    .then((data) => data.json())
    .then((data) => setRoutes(data));
  }, []);

  useEffect(() => {
    (async () => {
      await googleMapsLoader.load();
    })();
  },[]);

  const startRoute = useCallback((event: FormEvent) => {
    event.preventDefault();
    console.log(routeIdSelected);

  }, [routeIdSelected]);

  return (
    <Grid>
      <Grid item xs={12} sm={3}>
       <form onSubmit={startRoute}>
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
        <Button
          type="submit"
          color="primary"
          variant="contained"
        > Iniciar uma Corrida</Button>
       </form>
      </Grid>

      <Grid item xs={12} sm={9}>
        <div id="div"></div>
      </Grid>
    </Grid>
  );
};
