import {
  useState,
} from 'react';

import {
  AuthApiError,
} from '../api/auth-api';

import styles from './LoginPage.module.css';

interface LoginPageProps {
  readonly onLogin:
    (
      email:
        string,

      password:
        string,
    ) => Promise<void>;
}

export function LoginPage({
  onLogin,
}: LoginPageProps) {
  const [
    email,
    setEmail,
  ] =
    useState('');

  const [
    password,
    setPassword,
  ] =
    useState('');

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setSubmitting(
      true,
    );

    setError(
      null,
    );

    try {
      await onLogin(
        email,
        password,
      );
    } catch (error) {
      if (
        error instanceof
          AuthApiError
        &&
        error.code ===
          'INVALID_CREDENTIALS'
      ) {
        setError(
          'E-mail ou senha inválidos.',
        );

        return;
      }

      setError(
        error instanceof Error
          ? error.message
          : 'Não foi possível entrar.',
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  return (
    <main
      className={
        styles.page
      }
    >
      <section
        className={
          styles.presentation
        }
      >
        <div
          className={
            styles.brand
          }
        >
          <div
            className={
              styles.brandMark
            }
          >
            V
          </div>

          <div>
            <strong>
              VERSA
            </strong>

            <span>
              PLATFORM
            </span>
          </div>
        </div>

        <div
          className={
            styles.presentationContent
          }
        >
          <span
            className={
              styles.eyebrow
            }
          >
            Gestão + Inteligência
          </span>

          <h1>
            Sua operação em um
            único lugar.
          </h1>

          <p>
            Acesse o ambiente da Versa
            para acompanhar produtos,
            operações e inteligência do
            negócio.
          </p>
        </div>

        <span
          className={
            styles.presentationFooter
          }
        >
          Versa Platform
        </span>
      </section>

      <section
        className={
          styles.loginArea
        }
      >
        <div
          className={
            styles.loginCard
          }
        >
          <header
            className={
              styles.header
            }
          >
            <span>
              Bem-vindo
            </span>

            <h2>
              Entre na sua conta
            </h2>

            <p>
              Use suas credenciais para
              acessar a plataforma.
            </p>
          </header>

          <form
            className={
              styles.form
            }
            onSubmit={(event) => {
              void handleSubmit(
                event,
              );
            }}
          >
            <label
              className={
                styles.field
              }
            >
              <span>
                E-mail
              </span>

              <input
                type="email"
                value={
                  email
                }
                onChange={(event) => {
                  setEmail(
                    event.target.value,
                  );
                }}
                placeholder="voce@empresa.com"
                autoComplete="email"
                autoFocus
                disabled={
                  submitting
                }
                required
              />
            </label>

            <label
              className={
                styles.field
              }
            >
              <span>
                Senha
              </span>

              <input
                type="password"
                value={
                  password
                }
                onChange={(event) => {
                  setPassword(
                    event.target.value,
                  );
                }}
                placeholder="Sua senha"
                autoComplete="current-password"
                disabled={
                  submitting
                }
                required
              />
            </label>

            {error !== null ? (
              <div
                className={
                  styles.error
                }
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <button
              className={
                styles.submitButton
              }
              type="submit"
              disabled={
                submitting
              }
            >
              {submitting
                ? 'Entrando...'
                : 'Entrar'}
            </button>
          </form>

          <footer
            className={
              styles.cardFooter
            }
          >
            Ambiente protegido por
            sessão segura.
          </footer>
        </div>
      </section>
    </main>
  );
}