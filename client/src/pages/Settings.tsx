import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Shield, Brain, Bell, Download, FileText, BarChart3 } from 'lucide-react';

export const Settings: React.FC = () => {
  const [highRiskThreshold, setHighRiskThreshold] = useState(85);
  const [mediumRiskThreshold, setMediumRiskThreshold] = useState(60);
  const [transactionLimit, setTransactionLimit] = useState(10000);
  const [aiModel, setAiModel] = useState('gpt4o-mini');
  const [analysisFrequency, setAnalysisFrequency] = useState('realtime');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleExportCompliance = () => {
    console.log('Exporting compliance report...');
    // Add export logic here
  };

  const handleDownloadTransactions = () => {
    console.log('Downloading transaction data...');
    // Add download logic here
  };

  const handleGenerateAnalytics = () => {
    console.log('Generating analytics report...');
    // Add analytics logic here
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center border border-primary-100 dark:border-primary-800">
            <Shield className="w-6 h-6 text-primary-500 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">AML Settings & Configuration</h1>
            <p className="text-slate-600 dark:text-slate-400">Customize your fraud detection parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Thresholds Section */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Risk Thresholds</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    High Risk Threshold
                  </label>
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {highRiskThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  value={highRiskThreshold}
                  onChange={(e) => setHighRiskThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Medium Risk Threshold
                  </label>
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {mediumRiskThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="70"
                  value={mediumRiskThreshold}
                  onChange={(e) => setMediumRiskThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Transaction Amount Limit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">$</span>
                  <input
                    type="number"
                    value={transactionLimit}
                    onChange={(e) => setTransactionLimit(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* AI Model Configuration */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">AI Model Configuration</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Primary AI Model
                </label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="gpt4o-mini">GPT-4o-mini</option>
                  <option value="claude">Claude-3</option>
                  <option value="custom">Custom Model</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Analysis Frequency
                </label>
                <select
                  value={analysisFrequency}
                  onChange={(e) => setAnalysisFrequency(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Alerts
                </label>
                <button
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailAlerts ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  SMS Alerts
                </label>
                <button
                  onClick={() => setSmsAlerts(!smsAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    smsAlerts ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      smsAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Push Notifications
                </label>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    pushNotifications ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Export & Reports */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Export & Reports</h2>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleExportCompliance}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Compliance Report</span>
              </Button>

              <Button
                onClick={handleDownloadTransactions}
                variant="secondary"
                className="w-full flex items-center justify-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Download Transaction Data</span>
              </Button>

              <Button
                onClick={handleGenerateAnalytics}
                variant="secondary"
                className="w-full flex items-center justify-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Generate Analytics Report</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg" className="px-8">
            Save All Settings
          </Button>
        </div>
      </div>
    </Layout>
  );
};
