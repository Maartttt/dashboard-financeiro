// src/App.jsx
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [filter, setFilter] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({ type: "Entrada", amount: "", date: "" });
  const [balance, setBalance] = useState(0);

  // Carregar transações do localStorage
  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem("transactions"));
    if (storedTransactions) {
      setTransactions(storedTransactions);
    }
  }, []);

  // Atualizar localStorage sempre que as transações mudarem
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    }
  }, [transactions]);

  // Função para filtrar as transações conforme o filtro selecionado
  const filterTransactions = (filter) => {
    const today = new Date().toISOString().split("T")[0];
    switch (filter) {
      case "today":
        return transactions.filter((t) => t.date === today);
      case "thisWeek":
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const startOfWeekStr = startOfWeek.toISOString().split("T")[0];
        return transactions.filter((t) => t.date >= startOfWeekStr);
      case "thisMonth":
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const startOfMonthStr = startOfMonth.toISOString().split("T")[0];
        return transactions.filter((t) => t.date >= startOfMonthStr);
      case "all":
      default:
        return transactions;
    }
  };

  const filteredTransactions = filterTransactions(filter);

  // Calcula o saldo com as transações filtradas
  useEffect(() => {
    const newBalance = filteredTransactions.reduce(
      (acc, transaction) => (transaction.type === "Entrada" ? acc + transaction.amount : acc - transaction.amount),
      0
    );
    setBalance(newBalance);
  }, [filteredTransactions]);

  // Prepara os dados para o gráfico com as transações filtradas
  const chartData = {
    labels: ["Entradas", "Saídas"],
    datasets: [
      {
        label: "Valor",
        data: [
          filteredTransactions.filter((t) => t.type === "Entrada").reduce((sum, t) => sum + t.amount, 0),
          filteredTransactions.filter((t) => t.type === "Saída").reduce((sum, t) => sum + t.amount, 0),
        ],
        backgroundColor: ["#4CAF50", "#F44336"],
      },
    ],
  };

  // Função para adicionar uma nova transação
  const addTransaction = (e) => {
    e.preventDefault();
    if (newTransaction.amount && newTransaction.date) {
      const newTrans = {
        id: transactions.length + 1,
        type: newTransaction.type,
        amount: parseFloat(newTransaction.amount),
        date: newTransaction.date,
      };
      const updatedTransactions = [...transactions, newTrans];
      setTransactions(updatedTransactions);
      setNewTransaction({ type: "Entrada", amount: "", date: "" });
    } else {
      alert("Por favor, preencha todos os campos.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-800 text-white flex flex-col items-center p-6">
      <div className="w-full max-w-4xl bg-gray-900 p-8 rounded-lg shadow-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Dashboard Financeiro</h1>

        {/* Filtro de Data */}
        <div className="mb-8 text-center">
          <label htmlFor="dateFilter" className="mr-4 text-lg font-medium">Filtrar por Data:</label>
          <select
            id="dateFilter"
            className="p-3 rounded-lg bg-gray-700 text-white transition duration-300 ease-in-out hover:bg-gray-600"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="today">Hoje</option>
            <option value="thisWeek">Esta Semana</option>
            <option value="thisMonth">Este Mês</option>
          </select>
        </div>

        {/* Seção de Saldo */}
        <div className="bg-green-600 p-6 rounded-xl text-center mb-8 shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out">
          <h2 className="text-2xl font-semibold mb-2">Saldo Atual</h2>
          <p className="text-4xl font-bold">${balance.toFixed(2)}</p>
        </div>

        {/* Gráfico de Entradas e Saídas */}
        <div className="bg-gray-800 p-6 rounded-xl mb-8 shadow-xl transition-all duration-300 hover:scale-105 transform">
          <h3 className="text-2xl font-semibold mb-4">Gráfico de Entradas e Saídas</h3>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>

        {/* Lista de Transações */}
        <div className="bg-gray-800 p-6 rounded-xl mb-8 shadow-xl transition-all duration-300 hover:scale-105 transform">
          <h3 className="text-2xl font-semibold mb-4">Últimas Transações</h3>
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left">Data</th>
                <th className="py-2 px-4 text-left">Tipo</th>
                <th className="py-2 px-4 text-left">Valor</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-600 hover:bg-gray-600 transition-all ease-in-out duration-200">
                  <td className="py-2 px-4">{transaction.date}</td>
                  <td className={`py-2 px-4 ${transaction.type === "Entrada" ? "text-green-400" : "text-red-400"}`}>
                    {transaction.type}
                  </td>
                  <td className="py-2 px-4">${transaction.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Formulário para Adicionar Nova Transação */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl transition-all duration-300 hover:scale-105 transform">
          <h3 className="text-2xl font-semibold mb-4">Adicionar Nova Transação</h3>
          <form onSubmit={addTransaction} className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm mb-2" htmlFor="type">Tipo</label>
              <select
                id="type"
                value={newTransaction.type}
                onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                className="p-3 rounded-lg bg-gray-600 w-full transition duration-300 ease-in-out hover:bg-gray-500"
              >
                <option value="Entrada">Entrada</option>
                <option value="Saída">Saída</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2" htmlFor="amount">Valor</label>
              <input
                id="amount"
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                className="p-3 rounded-lg bg-gray-600 w-full transition duration-300 ease-in-out hover:bg-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2" htmlFor="date">Data</label>
              <input
                id="date"
                type="date"
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                className="p-3 rounded-lg bg-gray-600 w-full transition duration-300 ease-in-out hover:bg-gray-500"
                required
              />
            </div>

            <button type="submit" className="mt-4 p-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-all duration-300 ease-in-out">
              Adicionar Transação
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
