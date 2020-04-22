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
    string name;
    int state = 0;// 0 - command, 1 - transmit, 2 - receive
    int len;

    public Client(TcpClient c)
    {
        s = c.GetStream();
        client = c;
    }

    public void Dispose()
    {
        s.Dispose();
    }

    void ProcessMsg(string msg)
    {
        Console.Write($"msg from {name}:{msg}");
        switch (state)
        {
            case 0:
                var words = msg.TrimEnd('\r', '\n').Split(' ');
                switch (words[0])
                {
                    case "set_login":
                        if (name == null && words.Length > 1)
                        {
                            name = words[1];
                            if(s.CanWrite)
                                s.Write(Encoding.Default.GetBytes($"Login set to {name}"));
                        }
                        break;
                    case "send":
                        if (words.Length == 3 && Program.clients.Any(c => c.name == words[1]) && int.TryParse(words[2], out len) && len > 0)
                        {
                            state = 1;
                            Program.msgsInTransfer.Add(name, words[1]);
                            if (s.CanWrite)
                                s.Write(Encoding.Default.GetBytes($"User {name} state switched to {state}"));
                        }
                        else
                            len = 0;
                            if (s.CanWrite)
                                s.Write(Encoding.Default.GetBytes($"User {words[1]} not found"));
                        break;
                    case "receive":
                        state = 2;
                        break;
                    default:
                        if (s.CanWrite)
                            s.Write(Encoding.Default.GetBytes($"Unknown command"));
                        break;
                }
                break;
            case 1:
                Client cl = null;
                try
                {
                    len--;
                    cl = Program.clients.Last(c => c.name == Program.msgsInTransfer[name]);
                    while (!cl.s.CanWrite) { }
                    cl.s.Write(Encoding.Default.GetBytes(msg));
                }
                catch (InvalidOperationException)
                { }
                finally
                {
                    if (len == 0)
                    {
                        state = 0;
                        Program.msgsInTransfer.Remove(name);
                        if (s.CanWrite)
                            s.Write(Encoding.Default.GetBytes($"User {name} state switched to {state}"));
                    }
                }
                break;
            case 2:
                Console.WriteLine("Not implemented.");
                state = 0;
                break;
        }
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
            byte[] msg = new byte[256];     // готовим место для принятия сообщения
            int count = await s.ReadAsync(msg, 0, msg.Length);   // читаем сообщение от клиента
            ProcessMsg(Encoding.Default.GetString(msg, 0, count)); // выводим на экран полученное сообщение в виде строки
        }
        Program.clients.Remove(this);
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
