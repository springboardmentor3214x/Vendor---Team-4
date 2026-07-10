import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {

  const router = inject(Router);

  /*
    Temporary

    Later this value will come from
    the FastAPI Login API.
  */

  const userRole = localStorage.getItem('role');

  /*
    Roles allowed for this route
  */

  const allowedRoles = route.data['roles'] as string[];

  if (!allowedRoles || allowedRoles.length === 0) {

    return true;

  }

  if (userRole && allowedRoles.includes(userRole)) {

    return true;

  }

  router.navigate(['/login']);

  return false;

};