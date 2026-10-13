import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import{addIcons} from 'ionicons';
import{
//pegar los iconos
school,
easel,
people,
personCircleOutline, 
logOutOutline,
addOutline, 
playOutline, 
createOutline, 
trashOutline,
arrowBackOutline,
arrowForwardOutline,
syncOutline,
chevronForwardOutline,
checkboxOutline,
trophyOutline,
pauseOutline,
stopOutline,
timeOutline,
sparklesOutline,
checkmarkDoneOutline
}from 'ionicons/icons';
addIcons({
  //agregar los iconos que se van a usar
  'school':school,
  'easel':easel,
  'people':people,
  'personCircleOutline':personCircleOutline, 
  'logOutOutline':logOutOutline,
  'addOutline':addOutline, 
  'playOutline':playOutline, 
  'createOutline':createOutline, 
  'trashOutline':trashOutline,
  'arrowBackOutline':arrowBackOutline,
  'arrowForwardOutline':arrowForwardOutline,
  'syncOutline':syncOutline,
  'chevronForwardOutline':chevronForwardOutline,
  'checkboxOutline':checkboxOutline,
  'trophyOutline':trophyOutline,
  'pauseOutline':pauseOutline,
  'stopOutline':stopOutline,
  'timeOutline':timeOutline,
  'sparklesOutline':sparklesOutline,
  'checkmarkDoneOutline':checkmarkDoneOutline
}); 

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
