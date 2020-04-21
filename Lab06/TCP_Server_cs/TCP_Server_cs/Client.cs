using System;
using System.Text;
using System.Net;      // потребуется
using System.Net.Sockets;    // потребуется
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

class Client : IDisposable
{
    NetworkStream s;
    TcpClient client;


    public Client(TcpClient c)
    {
        s = c.GetStream();
        client = c;
    }

    public void Dispose()
    {
        s.Dispose();
    }

    async Task<byte[]> ReadFromStreamAsync(int nbytes)
    {
        var buf = new byte[nbytes];
        var readpos = 0;
        while (readpos < nbytes)
            readpos += await s.ReadAsync(buf, readpos, nbytes - readpos);
        return buf;
    }

    public async Task ProcessAsync()
    {
        while (client.Connected)
        {
            //var actionBuffer = await ReadFromStreamAsync(2);
            byte[] msg = new byte[1024];     // готовим место для принятия сообщения
            int count = await s.ReadAsync(msg, 0, msg.Length);   // читаем сообщение от клиента
            Console.Write(Encoding.Default.GetString(msg, 0, count)); // выводим на экран полученное сообщение в виде строки
        }
    }
    async Task<string> ReadWithTimeout(int n) // (*)
    {
        using (var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(1000)))
        {
            try
            {
                return Decode(await ReadFromStreamAsync(n, cts.Token));
            }
            catch (OperationCanceledException)
            {
                return null;
            }
        }
    }

    private string Decode(byte[] msg)
    {
        return Encoding.Default.GetString(msg);
    }

    async Task<byte[]> ReadFromStreamAsync(int nbytes, CancellationToken ct)
    {
        var buf = new byte[nbytes];
        var readpos = 0;
        while (readpos < nbytes)
            readpos += await s.ReadAsync(buf, readpos, nbytes - readpos, ct);
        return buf;
    }
}
