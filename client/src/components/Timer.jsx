import { useEffect, useState } from "react";
import { Row } from "react-bootstrap";

export function Timer(props) {
    const duration = props.duration;
    const start = props.start;
    const setStart = props.setStart;
    const setEnd = props.setEnd;
    
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (start) {
            setTimeout(() => {
                setTimeLeft(timeLeft - 1);
                if (timeLeft <= 0) {
                    setEnd(true);
                    setStart(false);
                }
            }, 1000);
        }
    }, [start, timeLeft]);

    return (
        <div className="d-inline-block badge rounded-pill mb-5" >
            <Row className="text-center">
                <span className="display-6 mt-1">
                    {timeLeft}
                </span>
                <p className="mb-2">
                    seconds
                </p>
            </Row>
        </div>
    );
}