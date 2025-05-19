import React, { useEffect, useState } from 'react';
import { getFund } from '../services/api';
import { useParams } from 'react-router-dom';

function FundList() {
    const { fundId } = useParams();
    const [fund, setFund] = useState(null)
    const [error, setError] = useState("");

    const fetchFundData = () => {
        if (fundId) {
            getFund()
                .then((res) => {
                    for (let i = 0; i < res.data.length; i++) { //loop the funds data
                        if (res.data[i].name === fundId) { // find the funds data with the same name with the fundId(pass in by the link )
                            setFund(res.data[i])
                        }
                    }
                })
                .catch((err) => {
                    console.error(`Failed to fetch Funds :`, err);
                    setError(`Failed to load Funds .`);
                });
        }
    }

    useEffect(() => {
        fetchFundData()
    }, [fundId]);

    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!fund && !error) return <p>Loading Funds...</p>;

    return (
        <div>
            <h1>{fund.name}</h1>
            <p>
                <small>
                    Description : {fund.description}
                </small>
            </p>
        </div>
    );
}

export default FundList;