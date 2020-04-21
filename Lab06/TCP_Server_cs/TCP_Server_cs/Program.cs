using System;
using System.Text;
using System.Net;      // потребуется
using System.Net.Sockets;    // потребуется
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

class Program
{
    static void Main()
    {
        RunServer();
        Console.ReadLine();
    }
    static async void RunServer()
    {
        var tcpListener = TcpListener.Create(1234);
        tcpListener.Start();
        while (true)
        {
            var tcpClient = await tcpListener.AcceptTcpClientAsync();
            _ = processClient(tcpClient); // await не нужен
        }
    }

    static HashSet<Task> activeClientTasks = new HashSet<Task>();
    public static Dictionary<string, string> msgsInTransfer = new Dictionary<string, string>();
    public static List<Client> clients = new List<Client>();

    static async Task processClient(TcpClient c)
    {
        using (var client = new Client(c))
        {
            clients.Add(client);
            Task task = client.ProcessAsync();
            activeClientTasks.Add(task);
            await task;
            clients.Remove(client);
        }
    }
}
