import React, { useState } from 'react';
import { CreditCard, Lock, Shield, CheckCircle, X, Star, Clock, Users, Award, Zap } from 'lucide-react';
import { InterviewProduct, Payment } from '../../types/products';

interface ProductPurchaseModalProps {
  product: InterviewProduct;
  onPurchase: (paymentData: any) => void;
  onStartTest: () => void;
  onClose: () => void;
  resumeAnalysis?: any;
}

export const ProductPurchaseModal: React.FC<ProductPurchaseModalProps> = ({
  product,
  onPurchase,
  onStartTest,
  onClose,
  resumeAnalysis
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTestMode, setShowTestMode] = useState(true);

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const paymentData = {
      id: `payment-${Date.now()}`,
      productId: product.id,
      amount: product.price,
      currency: 'USD',
      status: 'completed',
      paymentMethod,
      transactionId: `txn-${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date(),
      completedAt: new Date()
    };
    
    onPurchase(paymentData);
    setIsProcessing(false);
  };

  const handleTestMode = () => {
    // Create mock purchase for testing
    const mockPayment = {
      id: `test-payment-${Date.now()}`,
      productId: product.id,
      amount: 0,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'test',
      transactionId: 'TEST-MODE',
      createdAt: new Date(),
      completedAt: new Date()
    };
    
    onPurchase(mockPayment);
    onStartTest();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'audio': return 'from-blue-500 to-blue-600';
      case 'video': return 'from-purple-500 to-purple-600';
      case 'technical': return 'from-green-500 to-green-600';
      case 'behavioral': return 'from-orange-500 to-orange-600';
      case 'leadership': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-start space-x-6">
            <div className={`p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm`}>
              <Award className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{product.name}</h2>
              <p className="text-blue-100 text-lg mb-4">{product.description}</p>
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  {product.duration} minutes
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  {product.questionCount} questions
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  {product.difficulty} level
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">${product.price}</div>
              <div className="text-blue-100">one-time payment</div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Resume Compatibility Check */}
          {resumeAnalysis && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Perfect Match for Your Background
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-700">Your Role:</span>
                  <span className="ml-2 text-green-600">{resumeAnalysis.actualRole}</span>
                </div>
                <div>
                  <span className="font-medium text-green-700">Experience:</span>
                  <span className="ml-2 text-green-600">{resumeAnalysis.yearsOfExperience} years ({resumeAnalysis.seniority})</span>
                </div>
                <div>
                  <span className="font-medium text-green-700">Key Technologies:</span>
                  <span className="ml-2 text-green-600">{resumeAnalysis.keyTechnologies?.slice(0, 3).join(', ')}</span>
                </div>
                <div>
                  <span className="font-medium text-green-700">Skill Level:</span>
                  <span className="ml-2 text-green-600">Matches {product.difficulty} level requirements</span>
                </div>
              </div>
            </div>
          )}

          {/* Test Mode Option */}
          {showTestMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                🧪 Test Mode Available
              </h3>
              <p className="text-yellow-700 mb-4">
                Try this interview for free in test mode! You'll get the full experience with mock evaluation.
                Perfect for testing the system before implementing payments.
              </p>
              <button
                onClick={handleTestMode}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Test Interview (Free)
              </button>
            </div>
          )}

          {/* Product Details */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Features */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">What's Included</h3>
              <div className="space-y-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluation Criteria */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Evaluation Criteria</h3>
              <div className="space-y-3">
                {product.evaluationCriteria.map((criteria, index) => (
                  <div key={index} className="flex items-start">
                    <Star className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{criteria}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prerequisites */}
          {product.prerequisites && product.prerequisites.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Prerequisites</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {product.prerequisites.map((prereq, index) => (
                  <div key={index} className="flex items-center text-blue-700">
                    <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                    {prereq}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Complete Purchase</h3>
            
            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-sm font-medium">Credit Card</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-6 h-6 mx-auto mb-2 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">PP</div>
                  <div className="text-sm font-medium">PayPal</div>
                </button>
              </div>
            </div>

            {/* Mock Payment Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center text-green-800">
                <Shield className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Secure Payment Processing</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Purchase for ${product.price}
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>

            {/* Payment Notice */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                🧪 <strong>Test Mode:</strong> No actual payment will be processed. This is for demonstration purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};