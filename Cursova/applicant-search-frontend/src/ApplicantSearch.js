import React, { useState } from 'react';

function MessageBox({ message, type, onClose }) {
    return (
        <div className={`message-box ${type}`}>
            <div className="message-content">
                <p>{message}</p>
                <button onClick={onClose}>Закрити</button>
            </div>
        </div>
    );
}

function ApplicantSearch() {
    const [applicantName, setApplicantName] = useState('');
    const [results, setResults] = useState([]);
    const [passportDetails, setPassportDetails] = useState({
        fullName: '', address: '', phoneNumber: '', passportNumber: '', passportWho: '', passportWhen: '', passportSeries: '', RNOKPP: '',
        fullName2: '', address2: '', phoneNumber2: '', passportNumber2: '', passportWho2: '', passportWhen2: '', passportSeries2: '', RNOKPP2: ''
    });
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [showPassportForm, setShowPassportForm] = useState(false);
    const [showSearch, setShowSearch] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState('');

    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
    };

    const closeMessage = () => {
        setMessage(null);
        setMessageType('');
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/search_applicant/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicant_name: applicantName }),
            });
            if (!response.ok) throw new Error('Вступника не знайдено');
            const data = await response.json();
            setResults(data.results);
            showMessage('Пошук успішно виконано!', 'success');
        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (index) => {
        setSelectedIndex(index);
        setShowPassportForm(true);
        setShowSearch(false);
    };

    const handlePassportChange = (e) => {
        const { name, value } = e.target;
        setPassportDetails({ ...passportDetails, [name]: value });
    };

    const handleGenerateFile = async (templateName, fileNameSuffix) => {
        setLoading(true);
        const updatedItem = { 
            ...results[selectedIndex], 
            passportDetails, 
            template: templateName 
        };

        try {
            const response = await fetch('http://localhost:8000/api/generate_word_file/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedItem),
            });

            if (!response.ok) throw new Error('Помилка при генерації файлу');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${passportDetails.fullName}_${fileNameSuffix}.docx`;
            link.click();
            window.URL.revokeObjectURL(url);
            showMessage('Документ успішно створено!', 'success');
        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const applicantFields = [
        'fullName', 'address', 'phoneNumber', 'passportNumber', 'passportWho', 'passportWhen', 'passportSeries', 'RNOKPP'
    ];
    const representativeFields = [
        'fullName2', 'address2', 'phoneNumber2', 'passportNumber2', 'passportWho2', 'passportWhen2', 'passportSeries2', 'RNOKPP2'
    ];

    const fieldLabels = {
        fullName: "ПІБ вступника",
        address: "Адреса вступника",
        phoneNumber: "Телефон вступника",
        passportNumber: "Номер паспорта вступника",
        passportWho: "Ким виданий паспорт вступника",
        passportWhen: "Дата видачі паспорта вступника",
        passportSeries: "Серія паспорта вступника",
        RNOKPP: "РНОКПП вступника",
        fullName2: "ПІБ представника",
        address2: "Адреса представника",
        phoneNumber2: "Телефон представника",
        passportNumber2: "Номер паспорта представника",
        passportWho2: "Ким виданий паспорт представника",
        passportWhen2: "Дата видачі паспорта представника",
        passportSeries2: "Серія паспорта представника",
        RNOKPP2: "РНОКПП представника",
    };

    return (
        <div className="form-container">
            {message && (
                <MessageBox 
                    message={message} 
                    type={messageType} 
                    onClose={closeMessage} 
                />
            )}
            <h2>Пошук вступника</h2>
            {showSearch && (
                <div className="search-section">
                    <p>Введіть повне ім’я або прізвище для пошуку заявок на вступ до навчального закладу:</p>
                    <input 
                        type="text" 
                        value={applicantName} 
                        onChange={(e) => setApplicantName(e.target.value)} 
                        placeholder="Введіть прізвище вступника" 
                    />
                    <button onClick={handleSearch} disabled={loading}>{loading ? 'Завантаження...' : 'Знайти вступника'}</button>
                </div>
            )}

            {results.length > 0 && !showPassportForm && (
                <div>
                    <h3>Результати пошуку</h3>
                    <ul>
                        {results.map((result, index) => (
                            <li key={index}>
                                <strong>ОКР:</strong> {result['ОКР']} <br />
                                <strong>Структурний підрозділ:</strong> {result['Структурний підрозділ']} <br />
                                <strong>Назва КП:</strong> {result['Назва КП']} <br />
                                <strong>Форма навчання:</strong> {result['Форма навчання']} <br />
                                <button onClick={() => handleSelect(index)}>Переглянути деталі</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {showPassportForm && (
                <div>
                    <h3>Інформація про паспорт</h3>
                    <p>Будь ласка, заповніть паспортні дані вступника та представника для подальшого збереження інформації.</p>
                    <div className="passport-form">
                        <div className="form-section">
                            <h4>Дані вступника</h4>
                            {applicantFields.map((field, index) => (
                                <div key={index}>
                                    <label>{fieldLabels[field]}</label>
                                    <input
                                        type="text"
                                        name={field}
                                        value={passportDetails[field]}
                                        onChange={handlePassportChange}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="form-section">
                            <h4>Дані представника</h4>
                            {representativeFields.map((field, index) => (
                                <div key={index}>
                                    <label>{fieldLabels[field]}</label>
                                    <input
                                        type="text"
                                        name={field}
                                        value={passportDetails[field]}
                                        onChange={handlePassportChange}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button onClick={() => handleGenerateFile('template', 'навчання')} disabled={loading}>
                        {loading ? 'Завантаження...' : 'Згенерувати договір про навчання'}
                    </button>
                    {results[selectedIndex]['Статус заявки'] === 'Рекомендовано (контракт)' && (
                        <button onClick={() => handleGenerateFile('template2', 'платна_послуга')} disabled={loading}>
                            {loading ? 'Завантаження...' : 'Згенерувати договір про надання платних послуг'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default ApplicantSearch;
