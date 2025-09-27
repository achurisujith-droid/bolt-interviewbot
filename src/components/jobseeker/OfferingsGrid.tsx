import React, { useState } from 'react';
import { Clock, Users, Award, Star, Filter, Search, BookOpen, Target, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { InterviewOffering } from '../../types/offerings';
import { defaultOfferings } from '../../data/offerings';

interface OfferingsGridProps {
  onSelectOffering: (offering: InterviewOffering) => void;
  userCompletedOfferings?: string[]; // IDs of completed offerings
}

export const OfferingsGrid: React.FC<OfferingsGridProps> = ({ 
  onSelectOffering, 
  userCompletedOfferings = [] 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  const filteredOfferings = defaultOfferings.filter(offering => {
    const matchesSearch = offering.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offering.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offering.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || offering.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || offering.difficulty === selectedDifficulty;
    const matchesIndustry = selectedIndustry === 'all' || 
                           offering.industryFocus?.includes(selectedIndustry);
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesIndustry && offering.isActive;
  });

  // Get unique industries for filter
  const industries = Array.from(new Set(
    defaultOfferings.flatMap(offering => offering.industryFocus || [])
  )).sort();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <BookOpen className="w-5 h-5" />;
      case 'behavioral': return <Users className="w-5 h-5" />;
      case 'mixed': return <Target className="w-5 h-5" />;
      case 'specialized': return <Star className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-500';
      case 'behavioral': return 'bg-green-500';
      case 'mixed': return 'bg-purple-500';
      case 'specialized': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const isCompleted = (offeringId: string) => userCompletedOfferings.includes(offeringId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Interview</h2>
        <p className="text-gray-600">Select from our comprehensive range of AI-powered interview assessments</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search interviews by title, skills, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
              <option value="mixed">Mixed</option>
              <option value="specialized">Specialized</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="expert">Expert Level</option>
            </select>
          </div>
        </div>

        {/* Industry Filter - Second Row */}
        <div className="mt-4">
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Industries</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Showing {filteredOfferings.length} of {defaultOfferings.length} interviews</span>
        <span>{userCompletedOfferings.length} completed</span>
      </div>

      {/* Offerings Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOfferings.map((offering) => (
          <div
            key={offering.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer relative"
            onClick={() => onSelectOffering(offering)}
          >
            {/* Completion Status Badge */}
            {isCompleted(offering.id) && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </div>
              </div>
            )}

            {/* Header with category color */}
            <div className={`h-2 ${getCategoryColor(offering.category)}`}></div>
            
            <div className="p-6">
              {/* Title and Category */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(offering.category)}
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {offering.category}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(offering.difficulty)}`}>
                  {offering.difficulty}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">{offering.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{offering.description}</p>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{offering.duration} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{offering.questionCount} questions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>{offering.passingScore}% to pass</span>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {offering.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {offering.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{offering.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Prerequisites */}
              {offering.prerequisites && offering.prerequisites.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center text-xs text-amber-600 mb-1">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Prerequisites
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {offering.prerequisites.slice(0, 2).map((prereq, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Industry Focus */}
              {offering.industryFocus && offering.industryFocus.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Industry Focus:</div>
                  <div className="flex flex-wrap gap-1">
                    {offering.industryFocus.slice(0, 2).map((industry, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                {isCompleted(offering.id) ? (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Retake Interview
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start Interview
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredOfferings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No interviews found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};