import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import cn from 'classnames';

import { authService } from '../services/authService.js';
import { usePageError } from '../hooks/usePageError.js';

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

export const PasswordResetPage = () => {
  const [error, setError] = usePageError('');
  const [resetSuccessful, setResetSuccessful] = useState(false);
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  if (resetSuccessful) {
    return (
      <section className="">
        <h1 className="title">Password Reset Successful</h1>
        <p>Your password has been reset successfully. You can now log in with your new password.</p>
        <div className="field">
          <Link to="/login" className="button is-success has-text-weight-bold">Go to Login</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <Formik
        initialValues={{
          password: '',
          confirmPassword: '',
        }}
        validateOnMount={true}
        onSubmit={({ password, confirmPassword }, formikHelpers) => {
          formikHelpers.setSubmitting(true);

          if (password !== confirmPassword) {
            setError('Passwords do not match');
            formikHelpers.setSubmitting(false);
            return;
          }

          authService.resetPassword({ token, password })
            .then(() => {
              setResetSuccessful(true);
            })
            .catch((error) => {
              if (error.message) {
                setError(error.message);
              }

              if (!error.response?.data) {
                return;
              }

              const { message } = error.response.data;
              if (message) {
                setError(message);
              }
            })
            .finally(() => {
              formikHelpers.setSubmitting(false);
            });
          }
        }
      >
        {({ touched, errors, isSubmitting }) => (
          <Form className="box">
            <h1 className="title">Reset Password</h1>

            <div className="field">
              <label htmlFor="password" className="label">New password</label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validatePassword}
                  name="password"
                  type="password"
                  id="password"
                  placeholder="*******"
                  className={cn('input', {
                    'is-danger': touched.password && errors.password,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-lock"></i>
                </span>

                {touched.password && errors.password && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>

              {touched.password && errors.password ? (
                <p className="help is-danger">{errors.password}</p>
              ) : (
                <p className="help">At least 6 characters</p>
              )}
            </div>

            <div className="field">
              <label htmlFor="confirmPassword" className="label">Confirm new password</label>

              <div className="control has-icons-left has-icons-right">
                <Field
                  validate={validatePassword}
                  name="confirmPassword"
                  type="password"
                  id="confirmPassword"
                  placeholder="*******"
                  className={cn('input', {
                    'is-danger': touched.confirmPassword && errors.confirmPassword,
                  })}
                />

                <span className="icon is-small is-left">
                  <i className="fa fa-lock"></i>
                </span>

                {touched.confirmPassword && errors.confirmPassword && (
                  <span className="icon is-small is-right has-text-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                )}
              </div>

              {touched.confirmPassword && errors.confirmPassword && (
                <p className="help is-danger">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="field">
              <button
                type="submit"
                className={cn('button is-success has-text-weight-bold', {
                  'is-loading': isSubmitting,
                })}
                disabled={isSubmitting || errors.password || errors.confirmPassword}
              >
                Reset Password
              </button>
            </div>

            <p>
              Remembered your password?
              {' '}
              <Link to="/login">Log in</Link>
            </p>
          </Form>
        )}
      </Formik>

      {error && <p className="notification is-danger is-light">{error}</p>}
    </>
  );
};
