import React from "react";
import { Link } from "react-router-dom";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  SvgIconTypeMap,
} from "@material-ui/core";
// import DashboardIcon from "@material-ui/icons/Dashboard";
import HomeIcon from "@material-ui/icons/Home";
import StorageIcon from "@material-ui/icons/Storage";
import SettingsIcon from "@material-ui/icons/Settings";
import PeopleIcon from "@material-ui/icons/People";
import BarChartIcon from "@material-ui/icons/BarChart";
import LayersIcon from "@material-ui/icons/Layers";
import AssignmentIcon from "@material-ui/icons/Assignment";
import { newTabProps } from "utils";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";

const sideNavMainItems = [
  {
    name: "Dashboard",
    Icon: HomeIcon,
    path: "/",
  },
  {
    name: "Validators",
    Icon: StorageIcon,
    path: "/validators",
  },
  {
    name: "Settings",
    Icon: SettingsIcon,
    path: "/settings",
  },
];

const sideNameSecondaryItems = [
  {
    name: "Metrics",
    Icon: BarChartIcon,
    href:
      "http://dms.dappnode/d/DNPE2PAD/dappnode-eth-2-0-prysm-altona-dashboard",
  },
  {
    name: "Nodes",
    Icon: LayersIcon,
    href: "https://eth2stats.io/altona-testnet",
  },
  {
    name: "Logs",
    Icon: AssignmentIcon,
    href:
      "http://my.dappnode/#/packages/prysm-altona-validator.public.dappnode.eth/logs",
  },
  {
    name: "Support",
    Icon: PeopleIcon,
    href: "https://riot.im/app/#/room/#DAppNode:matrix.org",
  },
];

export const mainListItems = <div>{ListItems(sideNavMainItems)}</div>;

export const secondaryListItems = (
  <div>
    <ListSubheader inset>Help</ListSubheader>
    {ListItems(sideNameSecondaryItems)}
  </div>
);

function ListItems(
  items: {
    name: string;
    Icon: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
    href?: string;
    path?: string;
  }[]
) {
  return items.map(({ name, Icon, href, path }) =>
    href ? (
      <ListItem key={name} button component="a" href={href} {...newTabProps}>
        <ListItemIcon>
          <Icon />
        </ListItemIcon>
        <ListItemText primary={name} />
      </ListItem>
    ) : path ? (
      <Link to={path} style={{ color: "inherit", textDecoration: "none" }}>
        <ListItem key={name} button component="a">
          <ListItemIcon>
            <Icon />
          </ListItemIcon>
          <ListItemText primary={name} />
        </ListItem>
      </Link>
    ) : null
  );
}
