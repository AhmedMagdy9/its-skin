import { Routes } from '@angular/router';
import { HomeComponent } from './feature/pages/home/home.component';
import { AddproductComponent } from './feature/pages/addproduct/addproduct.component';
import { CartComponent } from './feature/pages/cart/cart.component';
import { DashbordComponent } from './feature/pages/dashbord/dashbord.component';
import { DeleteordersComponent } from './feature/pages/deleteorders/deleteorders.component';
import { FiltercategoryComponent } from './feature/pages/filtercategory/filtercategory.component';
import { OrdersComponent } from './feature/pages/orders/orders.component';

export const routes: Routes = [
    {path:'' ,       redirectTo:'home' , pathMatch:'full'},
    {path:'home' , component:HomeComponent , title:'its-Skin-Home'},
    {path:'addproduct' , component:AddproductComponent , title:'its-Skin-Add product'},
    {path:'cart' , component:CartComponent , title:'its-Skin-cart'},
    {path:'dashbord' , component:DashbordComponent , title:'its-Skin-Dashbord'},
    {path:'deleteorder' , component:DeleteordersComponent , title:'its-Skin-complated orders'},
    {path:'categorise' , component:FiltercategoryComponent , title:'its-Skin-categorise'},
    {path:'orders' , component:OrdersComponent , title:'its-Skin-orders'},
   
];
