#include <cstdlib>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <sstream>

using namespace std;

std::vector<std::string> split(const std::string& s, char delimiter);

int main()
{
    cout << "Content-Type: text/html; charset=utf-8\n";

    string queryString = string(getenv("QUERY_STRING"));
    string httpCookie = string(getenv("HTTP_COOKIE"));
    string history;
    int find_his;
    int cur_page=0;

    if ((find_his = httpCookie.find("history=")) == string::npos)
    {
        cur_page = 0;
    }
    else
    {
        history = httpCookie.substr(find_his + 8, httpCookie.find(';', find_his) - find_his - 8);
            cur_page = stoi(history.substr(history.find_last_of(',') + 1));
        if(queryString=="page=next")
            cur_page++;
        else if(queryString=="page=prev")
            cur_page--;

    }
    history += "," + to_string(cur_page);
    cout << "Set-Cookie: history="<< history <<"\n";
    cout << "\n";
/*
    ofstream f("get.txt");
    string s;
    if (f.is_open())
    {
        s = "Введенные в форму данные успешно записаны в файл <a href='get.txt'>get.txt</a>";
        f << "QUERY_STRING = " << queryString;
        f << "HTTP_COOKIE = " << httpCookie;
        f.close();
    } else
        s = "Error. File was not open!";
*/
    cout << "<html>\n <head>\n <title>CN_Lab05</title>\n </head>\n <body>\n <h1>" << "Page " << to_string(cur_page) << "<br>" << " </h1>\n" <<
    "<script type=\"text/javascript\">\n"
    "function setUrl() {\n"
    "    window.location.href = 'cgi_get.cgi?page=' + (arguments[0]==-1? \"prev\" : \"next\" );\n"
    "};\n"
    "</script>\n";
    cout << "<b>History:</b> " << history.substr(1) << "<br><br>";
    if (cur_page>0)
        cout << R"(<button type="button" id="prev-button" Onclick="setUrl(-1);" >Prev</button>)";
    if (cur_page<5)
        cout << R"(<button type="button" id="next-button" Onclick="setUrl(1);" >Next</button>)";
    /*auto history_pages = split(history,',');
    for(int i = 0; i < history_pages.size(); i++ )
        cout <<*/
    cout << "</body>";
    return 0;
}
std::vector<std::string> split(const std::string& s, char delimiter)
{
    std::vector<std::string> tokens;
    std::string token;
    std::istringstream tokenStream(s);
    while (std::getline(tokenStream, token, delimiter))
    {
        tokens.push_back(token);
    }
    return tokens;
}