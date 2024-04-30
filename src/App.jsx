import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Nav from './components/Nav/Nav';
import Welcome from './views/Welcome';
import Header from './components/Home/Header';
import MacroBreakdown from './components/Home/MacroBreakdown';
import DateDisplay from './components/Home/DateDisplay';
import NutritionResults from './views/NutritionResults';
import './App.css';

const initialState = {
  dish: '',
  imageURL: '',
  macros: {
    calories: 0,
    carbohydrates: 0,
    protein: 0,
    fat: 0
  },
  originalMacros: {
    calories: 0,
    carbohydrates: 0,
    protein: 0,
    fat: 0
  },
  ingredients: [],
  editVersion: 0
};

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [nutritionData, setNutritionData] = useState(initialState);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleNutritionData = (data) => {
    if (data && data.success && data.finalNutritionData) {
      setNutritionData({
        dish: data.finalNutritionData.dish,
        imageURL: data.finalNutritionData.imageURL,
        macros: {
          calories: data.finalNutritionData.macros.calories,
          carbohydrates: data.finalNutritionData.macros.carbohydrates,
          protein: data.finalNutritionData.macros.protein,
          fat: data.finalNutritionData.macros.fat
        },
        ingredients: data.finalNutritionData.ingredients,
        editVersion: nutritionData.editVersion + 1 
      });
      setShowEditModal(true);
    } else {
      console.error("Received data is missing 'finalNutritionData' or 'macros'");
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
  };

  const handleEditComplete = (updatedData) => {
    setNutritionData(prevData => {
      const newMacros = {
        calories: parseFloat(updatedData.totalCalories) || 0,
        carbohydrates: parseFloat(updatedData.totalCarbs) || 0,
        protein: parseFloat(updatedData.totalProteins) || 0,
        fat: parseFloat(updatedData.totalFat) || 0
      };
  
      const macroDifferences = {
        calories: newMacros.calories - ((prevData.macros?.calories || 0) - (prevData.originalMacros?.calories || 0)),
        carbohydrates: newMacros.carbohydrates - ((prevData.macros?.carbohydrates || 0) - (prevData.originalMacros?.carbohydrates || 0)),
        protein: newMacros.protein - ((prevData.macros?.protein || 0) - (prevData.originalMacros?.protein || 0)),
        fat: newMacros.fat - ((prevData.macros?.fat || 0) - (prevData.originalMacros?.fat || 0))
      };
  
      return {
        ...prevData,
        dish: updatedData.mealName,
        imageURL: updatedData.imageURL,
        macros: {
          calories: (prevData.macros?.calories || 0) + macroDifferences.calories,
          carbohydrates: (prevData.macros?.carbohydrates || 0) + macroDifferences.carbohydrates,
          protein: (prevData.macros?.protein || 0) + macroDifferences.protein,
          fat: (prevData.macros?.fat || 0) + macroDifferences.fat
        },
        originalMacros: newMacros,  // Update original macros to the new entry
        ingredients: updatedData.ingredients,
        editVersion: prevData.editVersion + 1
      };
    });
    setShowEditModal(false);
  };

  return (
    <BrowserRouter>
      <div className="app">
        {showWelcome ? (
          <Welcome />
        ) : (
          <>
            <Header />
            <DateDisplay />
            <main className="main-content">
            <MacroBreakdown nutrition={nutritionData.macros} />
              {showEditModal && (
                <NutritionResults
                  nutritionData={nutritionData}
                  onEditComplete={handleEditComplete}
                />
              )}
            </main>
            <Nav onNutritionDataReceived={handleNutritionData} />
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
