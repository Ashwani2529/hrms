/* eslint-disable */
import dashboard from './dashboard';
import application from './application';
import forms from './forms';
import elements from './elements';
import pages from './pages';
import utilities from './utilities';
import support from './support';
import other from './other';

// ==============================|| MENU ITEMS ||============================== //

//Function to control menu items visibility based on role

const menuItems = {
    items: [dashboard]
    // items: [dashboard, application, forms, elements, pages, utilities, support, other]
};

export default menuItems;
