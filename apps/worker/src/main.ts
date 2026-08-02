function shutdown(signal: NodeJS.Signals): void {
  console.info(`[worker] Sinal ${signal} recebido`);
  console.info('[worker] Worker encerrado');

  process.stdin.pause();
}

function main(): void {
  console.info('[worker] Worker iniciado');

  // Mantém o processo ativo enquanto ainda não existe
  // um consumidor real de eventos ou polling do banco.
  process.stdin.resume();

  process.once('SIGINT', () => {
    shutdown('SIGINT');
  });

  process.once('SIGTERM', () => {
    shutdown('SIGTERM');
  });
}

try {
  main();
} catch (error) {
  console.error('[worker] Falha inesperada', error);
  process.exitCode = 1;
}