import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn: boolean | undefined;
  isAdmin: boolean = false;
  userId: string = '';

  constructor(
    private afAuth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  getUid() {
    return this.afAuth.currentUser.then((user) => {
      if (user) {
        this.userId = user.uid;
      } else {
        this.userId = '';
      }
    });
  }

  checkAuthStatus() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.isLoggedIn = true;
        this.checkAdminStatus(user.uid);
      } else {
        this.isLoggedIn = false;
        this.isAdmin = false;
      }
    });
  }

  private checkAdminStatus(uid: string) {
    this.isAdmin = uid === 'fVDArFvFtTSI7J7Qt8dogNOumrI2';
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000,
    });
  }

  signUp(email: string, password: string) {
    this.afAuth.createUserWithEmailAndPassword(email, password)
      .then((result) => {
        result.user?.sendEmailVerification();
        if (!result.user?.emailVerified) {
          this.openSnackBar('❗Please check your email for verification.', 'OK!');
          this.logout();
          this.router.navigate(['/verification']);
        } else {
          this.isLoggedIn = true;
          this.openSnackBar('✅Successfully registered!', 'Nice!');
          this.router.navigate(['/']);
        }
      })
      .catch((error: any) => {
        this.isLoggedIn = false;
        if (error.code === 'auth/email-already-in-use') {
          this.openSnackBar('❗Email already in use. Please login or try another email.', 'OK!');
        } else {
          this.openSnackBar(error.message, 'Oh no!');
        }
      });
  }

  login(email: string, password: string) {
    this.afAuth.signInWithEmailAndPassword(email, password)
      .then((result) => {
        if (!result.user?.emailVerified) {
          this.openSnackBar('🛑Please verify your email first.', 'OK!');
          this.logout();
        } else {
          this.checkAdminStatus(result.user?.uid || '');
          this.isLoggedIn = true;
          this.openSnackBar('✅Successfully logged in!', 'Nice!');
          this.router.navigate(['/']);
        }
      })
      .catch((error: any) => {
        this.isLoggedIn = false;
        if (error.code === 'auth/invalid-credential') {
          this.openSnackBar('❌Invalid credentials. Please register or check values.', 'OK!');
        } else if (error.code === 'auth/invalid-email') {
          this.openSnackBar('❗Invalid email. Please enter a valid email.', 'OK!');
        } else if (error.code === 'auth/user-disabled') {
          this.openSnackBar('🚫User disabled. Please contact support.', 'OK!');
        } else if (error.code === 'auth/missing-password') {
          this.openSnackBar('🔑Missing password. Please enter a password.', 'OK!');
        } else if (error.code === 'auth/missing-email') {
          this.openSnackBar('❗Missing email. Please enter an email.', 'OK!');
        } else if (error.code === 'auth/invalid-login-credentials') {
          this.openSnackBar('❌Invalid credentials. Please register or check values.', 'OK!');
        }
        else {
          this.openSnackBar(error.message, 'Oh no!');
        }
      });
  }

  logout() {
    this.afAuth.signOut()
      .then(() => {
        this.isLoggedIn = false;
        this.isAdmin = false;
        if (!this.snackBar._openedSnackBarRef) {
          this.openSnackBar('Logged out!', 'Goodbye 🙁');
          this.router.navigate(['/']);
        }
      })
      .catch((error) => {
        this.isLoggedIn = true;
        this.openSnackBar(error.message, 'Oh no!');
      });
  }

  resetPassword(email: string) {
    this.afAuth.sendPasswordResetEmail(email)
      .then(() => {
        this.openSnackBar('✅Password reset email sent!', 'OK!');
        this.router.navigate(['/login']);
      })
      .catch((error: any) => {
        if (error.code === 'auth/missing-email') {
          this.openSnackBar('❗Missing email. Please enter an email.', 'OK!');
        } else if (error.code === 'auth/invalid-email') {
          this.openSnackBar('❗Invalid email. Please enter a valid email.', 'OK!');
        }
        else {
          this.openSnackBar(error.message, 'Oh no!');
        }
      });
  }
}
