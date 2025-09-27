import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, Users, Star, ChevronRight, Briefcase, Code, Heart, TrendingUp, Play, Award, CheckCircle, Lock, Zap } from 'lucide-react';
import { InterviewProduct } from '../../types/products';
import { interviewProducts, getRecommendedProducts } from '../../data/products';

interface OfferingsGridProps {
  onSelectOffering: (product: InterviewProduct) => void;
  resumeAnalysis?: any;
  userPurchases?: any[];
}

export const OfferingsGrid: React.FC<OfferingsGridProps> = ({ 
  onSelectOffering, 
  resumeAnalysis,
  userPurchases = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showRecommended, setShowRecommended] = useState(true);

  const types = [
    { id: 'all', name: 'All Types', icon: Briefcase },
    { id: 'audio', name: 'Audio Interview', icon: Users },
    { id: 'video', name: 'Video Interview', icon: Code },
    { id: 'technical', name: 'Technical Deep Dive', icon: Code },
    { id: 'behavioral', name: 'Behavioral', icon: Heart },
    { id: 'leadership', name: 'Leadership', icon: TrendingUp }
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'entry', name: 'Entry Level' },
    { id: 'mid', name: 'Mid Level' },
    { id: 'senior', name: 'Senior Level' },
    { id: 'expert', name: 'Expert Level' }
  ];

  const filteredProducts = interviewProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || product.type === selectedType;
    const matchesDifficulty = selectedDifficulty === 'all' || product.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesType && matchesDifficulty && product.isActive;
  });

  const recommendedProducts = resumeAnalysis ? getRecommendedProducts(resumeAnalysis) : [];

  const hasUserPurchased = (productId: string): boolean => {
    return userPurchases.some(purchase => 
      purchase.productId === productId && 
      (purchase.status === 'active' || purchase.status === 'used')
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'entry': return 'bg-green-100 text-green-800 border-green-200';
      case 'mid': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'senior': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'audio': return Users;
      case 'video': return Code;
      case 'technical': return Code;
      case 'behavioral': return Heart;
      case 'leadership': return TrendingUp;
      default: return Briefcase;
    }
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Interview Products
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Choose from our premium collection of AI-powered interview experiences, each tailored to different career levels and assessment needs
        </p>
      </div>

      {/* Resume-Based Recommendations */}
      {resumeAnalysis && recommendedProducts.length > 0 && showRecommended && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                🎯 Recommended for You
              </h3>
              <p className="text-gray-600">
                Based on your {resumeAnalysis.actualRole || 'background'} with {resumeAnalysis.yearsOfExperience} years of experience
              </p>
            </div>
            <button
              onClick={() => setShowRecommended(false)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Hide
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedProducts.slice(0, 3).map((product) => {
              const TypeIcon = getTypeIcon(product.type);
              const isPurchased = hasUserPurchased(product.id);
              
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  onClick={() => onSelectOffering(product)}
                >
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-500 to-transparent w-32 h-32 opacity-10"></div>
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-gradient-to-r ${getTypeColor(product.type)} rounded-xl shadow-lg`}>
                        <TypeIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">${product.price}</div>
                        <div className="text-xs text-gray-500">one-time</div>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h4>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {product.duration}m
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {product.questionCount} questions
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(product.difficulty)}`}>
                        {product.difficulty} level
                      </span>
                      {isPurchased ? (
                        <span className="flex items-center text-green-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Purchased
                        </span>
                      ) : (
                        <span className="text-blue-600 font-medium text-sm">Recommended</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search interview products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[180px]"
            >
              {types.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[140px]"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty.id} value={difficulty.id}>
                  {difficulty.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredProducts.length} of {interviewProducts.length} interview products
        </p>
        <div className="text-sm text-gray-500">
          💡 Prices shown are for testing - payment integration coming soon
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => {
          const TypeIcon = getTypeIcon(product.type);
          const isPurchased = hasUserPurchased(product.id);
          const isRecommended = recommendedProducts.some(rp => rp.id === product.id);
          
          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl shadow-lg border hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                isRecommended ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-200'
              }`}
              onClick={() => onSelectOffering(product)}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  ⭐ RECOMMENDED
                </div>
              )}
              
              {/* Purchased Badge */}
              {isPurchased && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  OWNED
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 bg-gradient-to-r ${getTypeColor(product.type)} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <TypeIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800">${product.price}</div>
                    <div className="text-sm text-gray-500">one-time payment</div>
                  </div>
                </div>

                {/* Title and Description */}
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {product.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-gray-800">{product.duration}m</div>
                    <div className="text-xs text-gray-500">Duration</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-gray-800">{product.questionCount}</div>
                    <div className="text-xs text-gray-500">Questions</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                    <div className="text-sm font-semibold text-gray-800">{product.passingScore}%</div>
                    <div className="text-xs text-gray-500">Pass Score</div>
                  </div>
                </div>

                {/* Difficulty Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getDifficultyColor(product.difficulty)}`}>
                    {product.difficulty.charAt(0).toUpperCase() + product.difficulty.slice(1)} Level
                  </span>
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                </div>

                {/* Key Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Key Features:</h4>
                  <div className="space-y-2">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                    {product.features.length > 3 && (
                      <div className="text-xs text-blue-600 font-medium">
                        +{product.features.length - 3} more features
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills Assessed */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Skills Assessed:</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.skillsAssessed.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center ${
                  isPurchased 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                }`}>
                  {isPurchased ? (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start Interview
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Purchase & Start
                    </>
                  )}
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Test Mode Notice */}
                {!isPurchased && (
                  <div className="mt-3 text-center">
                    <span className="text-xs text-gray-500 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                      🧪 Test Mode: Payment integration coming soon
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* All Products Section */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">All Interview Products</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const TypeIcon = getTypeIcon(product.type);
            const isPurchased = hasUserPurchased(product.id);
            
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group"
                onClick={() => onSelectOffering(product)}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 bg-gradient-to-r ${getTypeColor(product.type)} rounded-lg`}>
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h4>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(product.difficulty)}`}>
                          {product.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-800">${product.price}</div>
                      {isPurchased && (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{product.duration} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{product.questionCount} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>4.8</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 transform group-hover:scale-[1.02] ${
                    isPurchased 
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  }`}>
                    {isPurchased ? 'Start Interview' : 'Purchase & Start'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('all');
              setSelectedDifficulty('all');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};