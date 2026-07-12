import { inject } from '@angular/core';

import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';


export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {

  const router = inject(Router);

  const userRole =
    localStorage.getItem('role')
      ?.trim()
      .toLowerCase();

  const allowedRoles =
    (route.data['roles'] || [])
      .map(
        (role: string) =>
          role.trim().toLowerCase()
      );


  if (
    userRole &&
    allowedRoles.includes(userRole)
  ) {

    return true;

  }


  router.navigate(['/login']);

  return false;

};