import './App.css';
import { useState, useRef, useEffect } from 'react';
import { createChart } from 'lightweight-charts';
import * as dayjs from 'dayjs';

const token = '';
const headers = new Headers();
headers.append('access-token', token);
headers.append('Content-Type', 'application/json');
let series;
let c;

let format = function (n) {
  return new Intl.NumberFormat('pt-BR').format(n);
};

function App() {
  const [option, setOption] = useState({ symbol: 'BBDC4' });
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const chart = useRef(null);

  useEffect(() => {
    c = createChart(chart.current, {
      width: 700,
      height: 300,
    });
    c.applyOptions({
      layout: {
        backgroundColor: '#FFFFFF',
        lineColor: '#2B2B43',
        textColor: '#191919',
      },
      watermark: {
        color: 'rgba(0, 0, 0, 0)',
      },
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          color: '#f0f3fa',
        },
      },
    });
    series = c.addAreaSeries();
  }, []);

  useEffect(() => {
    if (!data.length) return;
    series.applyOptions({
      topColor: 'rgba(32, 226, 47, 0.56)',
      bottomColor: 'rgba(32, 226, 47, 0.04)',
      lineColor: 'rgba(127, 226, 154, 1)',
    });
    series.setData(
      data.map((d) => {
        return {
          time: dayjs(d.time).format('YYYY-MM-DD'),
          value: d.close,
        };
      })
    );
    c.timeScale().fitContent();
  }, [data]);

  return (
    <div className='App'>
      <div style={{ padding: 20 }}>
        <span style={{ padding: '0 5px' }}>Escolha uma opção:</span>
        <input
          type='text'
          onChange={({ target: { value } }) =>
            setOption({ ...option, symbol: value })
          }
        ></input>
        <button
          style={{ padding: '0 5px' }}
          onClick={() => {
            setLoading(true);
            setVisible(false);
            fetch(
              `https://lorraine.oplab.com.br/v3/market/options/details/${option.symbol}`,
              {
                method: 'GET',
                headers,
              }
            )
              .then((r) => r.json())
              .then((option) => {
                setOption(option);
                return fetch(
                  `https://lorraine.oplab.com.br/v3/market/historical/${option.symbol}/1d?amount=30&fill=business_days&smooth=true`,
                  {
                    method: 'GET',
                    headers,
                  }
                );
              })
              .then((r) => r.json())
              .then(({ data }) => {
                setData(data);
                setVisible(true);
                setLoading(false);
              });
          }}
        >
          Buscar
        </button>
      </div>

      <div
        className={visible ? 'visible' : 'hidden'}
        style={{
          width: '100%',
          padding: 10,
          boxSizing: 'border-box',
          transition: 'opacity 2s',
        }}
      >
        <table>
          <thead>
            <tr>
              <th>Strike</th>
              <th>Preço da Ação</th>
              <th>Tipo</th>
              <th>Vence em</th>
              <th>Preço de Venda</th>
              <th>Preço de Compra</th>
              <th>Último Preço</th>
              <th>Último Negócio</th>
              <th>Característica</th>
              <th>Market Maker</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{format(option.strike)}</td>
              <td>{format(option.spot_price)}</td>
              <td>{option.type}</td>
              <td>{dayjs(option.due_date).format('DD-MM-YYYY')}</td>
              <td>{format(option.bid)}</td>
              <td>{format(option.ask)}</td>
              <td>{format(option.close)}</td>
              <td>{dayjs(option.last_trade_at).format('DD-MM-YYYY')}</td>
              <td>
                {option.maturity_type?.toLowerCase() === 'american'
                  ? 'Americana'
                  : 'Européia'}
              </td>
              <td>{option.market_maker ? 'Sim' : 'Não'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        style={{ transition: 'opacity 2s', margin: '0 auto' }}
        className={visible ? 'visible' : 'hidden'}
        ref={chart}
      ></div>
    </div>
  );
}

export default App;
